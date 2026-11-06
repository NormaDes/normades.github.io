import type { SpeakingCollabContent, SpeakingLongTurnContent, SpeakingQuestionsContent } from "@/lib/schemas";

export const s1Seeds: Array<{ id: string; data: SpeakingQuestionsContent }> = [
  {
    id: "seed-s1-set-a",
    data: {
      title: "Interview — Set A",
      topic: "Personal questions",
      questions: [
        "Where are you from, and what do you like most about living there?",
        "What do you usually do in your free time?",
        "Tell us about a trip or holiday you remember particularly well.",
        "How do you usually keep up with the news?",
        "Do you prefer studying alone or with other people? Why?",
        "What would you like to be doing in five years' time?",
      ],
    },
  },
  {
    id: "seed-s1-set-b",
    data: {
      title: "Interview — Set B",
      topic: "Personal questions",
      questions: [
        "What made you decide to study English to this level?",
        "Describe a typical weekday for you.",
        "Is there a skill you would love to learn? Why?",
        "How important is it for you to spend time outdoors?",
        "Tell us about someone who has influenced you.",
        "How has technology changed the way you study or work?",
      ],
    },
  },
];

export const s2Seeds: Array<{ id: string; data: SpeakingLongTurnContent }> = [
  {
    id: "seed-s2-volunteering",
    data: {
      title: "Long turn — Volunteering",
      topic: "Community",
      instruction:
        "Compare the two situations and say why the people might have chosen to do these activities, and how rewarding they might find them. You have about one minute.",
      photos: [
        { description: "Photo 1: A group of teenagers planting young trees on a bare hillside on a cloudy day, wearing gloves and carrying spades." },
        { description: "Photo 2: Two adult volunteers painting a classroom wall in bright colours while a group of small children watches and laughs." },
      ],
      partnerQuestion: "Which of these activities would you prefer to do?",
    },
  },
  {
    id: "seed-s2-travel",
    data: {
      title: "Long turn — Ways of travelling",
      topic: "Travel",
      instruction:
        "Compare the two situations and say what the advantages and disadvantages of travelling in these ways might be. You have about one minute.",
      photos: [
        { description: "Photo 1: A man cycling alone along a quiet country road with a loaded bicycle, mountains in the background." },
        { description: "Photo 2: A large group of tourists crowded on a open-top bus in a busy European city centre, taking photographs." },
      ],
      partnerQuestion: "Which way of travelling would you find more relaxing?",
    },
  },
];

export const s3Seeds: Array<{ id: string; data: SpeakingCollabContent }> = [
  {
    id: "seed-s3-community",
    data: {
      title: "Collaborative task — Helping the community",
      topic: "Community",
      question: "How effective might these things be in helping people feel part of their local community?",
      options: ["organising street parties", "creating community gardens", "setting up a local website", "offering free language classes", "running sports tournaments"],
      decisionQuestion: "Which two of these would make the biggest difference?",
    },
  },
  {
    id: "seed-s3-learning",
    data: {
      title: "Collaborative task — Learning outside school",
      topic: "Education",
      question: "How useful might these activities be for helping young people learn important life skills?",
      options: ["taking a part-time job", "volunteering abroad", "joining a sports team", "learning to cook", "managing a small budget"],
      decisionQuestion: "Which one would be the most valuable?",
    },
  },
];

export const s4Seeds: Array<{ id: string; data: SpeakingQuestionsContent }> = [
  {
    id: "seed-s4-community",
    data: {
      title: "Further discussion — Community",
      topic: "Society",
      questions: [
        "Some people say that communities are weaker today than in the past. What's your opinion?",
        "Do you think technology brings people closer together or keeps them apart?",
        "How important is it for young people to take part in their local community?",
        "Should governments do more to encourage volunteering?",
      ],
    },
  },
  {
    id: "seed-s4-learning",
    data: {
      title: "Further discussion — Education",
      topic: "Education",
      questions: [
        "How much should schools focus on preparing students for work rather than for life in general?",
        "Do you think exams are the best way to measure what someone has learnt?",
        "Is it more important to be good at one thing or to know a little about many things?",
        "How will learning change in the next twenty years?",
      ],
    },
  },
];
