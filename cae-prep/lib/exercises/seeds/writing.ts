import type { EssayContent, WritingChoiceContent } from "@/lib/schemas";

export const w1Seeds: Array<{ id: string; data: EssayContent }> = [
  {
    id: "seed-w1-traffic",
    data: {
      title: "Reducing traffic in cities",
      topic: "Cities and transport",
      question:
        "Your class has attended a panel discussion on how cities can reduce traffic congestion. You have made the notes below.",
      points: ["improving public transport", "restricting private cars in city centres", "your own idea"],
    },
  },
  {
    id: "seed-w1-school-work",
    data: {
      title: "Preparing young people for work",
      topic: "Education",
      question:
        "Your class has attended a seminar on how schools can best prepare young people for the world of work. You have made the notes below.",
      points: ["teaching practical skills", "work experience placements", "your own idea"],
    },
  },
  {
    id: "seed-w1-health",
    data: {
      title: "Encouraging healthier lifestyles",
      topic: "Health",
      question:
        "Your class has attended a talk on how governments can encourage people to lead healthier lives. You have made the notes below.",
      points: ["better food education", "more public sports facilities", "your own idea"],
    },
  },
];

export const w2Seeds: Array<{ id: string; data: WritingChoiceContent }> = [
  {
    id: "seed-w2-set-a",
    data: {
      title: "Conference, library and book",
      topic: "Mixed tasks",
      tasks: [
        {
          type: "email",
          situation:
            "You recently attended a two-day conference in another city. The organiser has emailed all participants asking for feedback so that next year's event can be improved. You decide to reply.",
          requirements: ["describe the sessions you found most useful", "explain what could be improved", "say whether you would attend again and why"],
        },
        {
          type: "report",
          situation:
            "You are a member of the student council at your college. The principal has asked you to write a report on the college library so that the budget for next year can be decided.",
          requirements: ["describe how the library is currently used", "explain the main problems students face", "recommend how the money should be spent"],
        },
        {
          type: "review",
          situation:
            "An English-language magazine for young adults has invited readers to submit reviews of a book that changed the way they think about something. You decide to write a review.",
          requirements: ["outline what the book is about", "explain how it changed your thinking", "say whether you would recommend it and to whom"],
        },
      ],
    },
  },
  {
    id: "seed-w2-set-b",
    data: {
      title: "Town grant, letter and app",
      topic: "Mixed tasks",
      tasks: [
        {
          type: "proposal",
          situation:
            "Your town council has received a grant to improve leisure facilities for young people and has asked local residents to submit proposals. You decide to write one.",
          requirements: ["describe the facility you would like to see", "explain why young people would use it", "suggest how it could be paid for in the long term"],
        },
        {
          type: "letter",
          situation:
            "A local newspaper has published an article claiming that young people today are less interested in volunteering than previous generations. You disagree and decide to write a letter to the editor.",
          requirements: ["explain why you disagree with the article", "give examples of young people's involvement in their community", "suggest how more people could be encouraged to volunteer"],
        },
        {
          type: "review",
          situation:
            "A website for language learners is collecting reviews of apps and websites that help people study. You decide to write a review of one you have used regularly.",
          requirements: ["describe what the app or website offers", "evaluate how useful it has been for you", "say who would or would not benefit from it"],
        },
      ],
    },
  },
];
