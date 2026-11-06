import type { GappedTextContent } from "@/lib/schemas";

export const r7Seeds: Array<{ id: string; data: GappedTextContent }> = [
  {
    id: "seed-r7-orchard",
    data: {
      title: "The orchard in the hills",
      topic: "Heritage and nature",
      text: `When Tom Aldridge inherited his grandmother's cottage in the Herefordshire hills, he also inherited a problem: an orchard of some forty apple trees, most of them so overgrown that he could barely walk between them. His first instinct was to cut the lot down and sow grass.

{{1}}

The answer, it turned out, was far from simple. None of the trees was labelled, and no book in the cottage mentioned them. Tom took a few samples to Ivy Pritchard, a retired nurseryman who had spent sixty years studying old varieties. She named three at a glance; the rest, she said, were probably local types that had never been given a proper name.

{{2}}

He spent that winter pruning the trees back to health and, under Ivy's guidance, learning to graft. By spring he had a row of young saplings in the garden, each one a copy of a tree that might otherwise have vanished.

{{3}}

Word spread quickly. Neighbours began to bring fruit from their own gardens, hoping Tom could tell them what they had, and before long he was receiving parcels from as far away as Scotland.

{{4}}

The collection now includes more than two hundred varieties, many of which exist nowhere else. Each is recorded in a ledger, with a note of where it came from and who once looked after it.

{{5}}

Not everything has gone smoothly, however. A late frost in April destroyed most of the blossom, and Tom was forced to buy in fruit to keep the cider press running.

{{6}}

Whatever happens, Tom is clear about what he wants to leave behind. "The trees were here long before me," he says, "and with a bit of luck they'll be here long after I've gone."`,
      paragraphs: [
        {
          letter: "A",
          text: "News of the ledger has brought visitors too. On autumn weekends, families wander between the rows with paper bags, tasting fruit they have never heard of and arguing cheerfully about which is best.",
        },
        {
          letter: "B",
          text: "He gave the first few away to friends, each with a handwritten label describing the tree it had come from and a promise that he would want to hear how it fared.",
        },
        {
          letter: "C",
          text: "Supermarkets, meanwhile, stock only a handful of varieties, chosen because they travel well and look uniform on the shelf. Many traditional apples have disappeared from the shops for exactly that reason.",
        },
        {
          letter: "D",
          text: "Then, one October morning, he picked up a windfall and bit into it. The flavour was unlike anything he had ever bought in a shop: sharp, sweet and faintly scented with pear. He decided he had to find out what it was.",
        },
        {
          letter: "E",
          text: "Tom is philosophical about it. Fruit trees, he points out, have survived far worse winters than this one, and the ones he lost will be replaced with grafts taken from the survivors.",
        },
        {
          letter: "F",
          text: "Each parcel was opened with a mixture of hope and suspicion. Many turned out to be common varieties found in any garden centre; a few, to his delight, were completely unknown, and these he grafted and planted in the field behind the cottage, so that the orchard slowly became a collection.",
        },
        {
          letter: "G",
          text: "For Tom, this was the turning point. What had looked like a burden now seemed more like a responsibility: if these trees disappeared, so would their apples, and nobody would ever taste them again.",
        },
      ],
      gaps: [
        {
          n: 1,
          correct: 3,
          explanation: "D contrasta con 'his first instinct was to cut the lot down' (Then…) y su 'it' / 'what it was' enlaza con 'The answer' del párrafo siguiente.",
          evidence: "He decided he had to find out what it was. / The answer, it turned out, was far from simple.",
          skill: "reference",
        },
        {
          n: 2,
          correct: 6,
          explanation: "G: 'this' se refiere a que los árboles eran variedades locales sin nombre; y lleva a que Tom pase el invierno cuidándolos.",
          evidence: "For Tom, this was the turning point... / He spent that winter pruning the trees back to health",
          skill: "reference",
        },
        {
          n: 3,
          correct: 1,
          explanation: "B retoma 'young saplings' (the first few) y prepara 'Word spread quickly' (regaló los primeros a amigos y se corrió la voz).",
          evidence: "He gave the first few away to friends... / Word spread quickly.",
          skill: "lexical chain",
        },
        {
          n: 4,
          correct: 5,
          explanation: "F continúa con 'parcels' del párrafo anterior ('Each parcel…') e introduce 'a collection', que retoma 'The collection now includes…'.",
          evidence: "Each parcel was opened... / The collection now includes more than two hundred varieties",
          skill: "lexical chain",
        },
        {
          n: 5,
          correct: 0,
          explanation: "A menciona 'the ledger' (ya citado) y presenta un aspecto positivo; 'Not everything has gone smoothly, however' contrasta con él.",
          evidence: "News of the ledger has brought visitors too. / Not everything has gone smoothly, however.",
          skill: "contrast",
        },
        {
          n: 6,
          correct: 4,
          explanation: "E: 'it' = la helada de abril; su actitud filosófica enlaza con 'Whatever happens' del último párrafo.",
          evidence: "Tom is philosophical about it. / Whatever happens, Tom is clear about what he wants to leave behind.",
          skill: "reference",
        },
      ],
    },
  },
];
