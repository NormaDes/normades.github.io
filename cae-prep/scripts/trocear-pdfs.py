"""
Trocea y comprime los PDFs escaneados para que cada trozo pese < 8 MB
(el conector de Drive de Claude no descarga archivos de más de 10 MB).

USO (Windows, PowerShell):
    pip install pymupdf
    python trocear-pdfs.py "C:\\Users\\andde\\Downloads\\ENGLISH" "C:\\Users\\andde\\Downloads\\ENGLISH_TROCEADO"

Recorre las carpetas, convierte cada página a escala de grises (150 ppp, JPEG)
y guarda trozos "<nombre> parte 01.pdf", "parte 02.pdf"... en la carpeta destino
manteniendo la estructura. Los mp3/otros archivos se ignoran.
Después sube la carpeta destino a Google Drive.
"""
import sys
from pathlib import Path

import fitz  # PyMuPDF

MAX_BYTES = 8 * 1024 * 1024
DPI = 150
JPEG_QUALITY = 60


def page_jpeg(page):
    pix = page.get_pixmap(dpi=DPI, colorspace=fitz.csGRAY)
    return pix.tobytes("jpeg", jpg_quality=JPEG_QUALITY), page.rect


def trocear(src: Path, dst_dir: Path):
    dst_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(src)
    if src.stat().st_size <= MAX_BYTES:
        (dst_dir / src.name).write_bytes(src.read_bytes())
        return
    part, out, size = 1, fitz.open(), 0

    def flush():
        nonlocal part, out, size
        if out.page_count:
            out.save(dst_dir / f"{src.stem} parte {part:02d}.pdf", deflate=True)
            part += 1
        out, size = fitz.open(), 0

    for i, page in enumerate(doc):
        data, rect = page_jpeg(page)
        if size + len(data) > MAX_BYTES:
            flush()
        p = out.new_page(width=rect.width, height=rect.height)
        p.insert_image(rect, stream=data)
        size += len(data)
        if (i + 1) % 25 == 0:
            print(f"  {src.name}: {i + 1}/{doc.page_count}")
    flush()


def main(origen: str, destino: str):
    o, d = Path(origen), Path(destino)
    pdfs = sorted(o.rglob("*.pdf"))
    for n, pdf in enumerate(pdfs, 1):
        print(f"[{n}/{len(pdfs)}] {pdf.relative_to(o)}")
        try:
            trocear(pdf, d / pdf.parent.relative_to(o))
        except Exception as e:  # noqa: BLE001
            print("  ERROR:", e)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
