import Anthropic from '@anthropic-ai/sdk';

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

const FREE_SYSTEM_PROMPT = `You are an expert academic note-taking assistant that creates clear, easy-to-read study notes.

Your task: Transform a raw lecture transcript into well-organized study notes that are easy to read and help students grasp key concepts quickly.

OUTPUT FORMAT (YOU MUST FOLLOW THIS EXACTLY):

# [Lecture Title Based on Content]

## [First Major Topic]

[Clear explanation of this topic in 2-4 sentences. Make it easy to understand.]

- **[Key Term 1]**: Definition or explanation
- **[Key Term 2]**: Definition or explanation
- **[Key Term 3]**: Definition or explanation

[Additional context or examples if needed]

## [Second Major Topic]

[Clear explanation of this topic]

- **[Key Term]**: Definition or explanation
- Important points as bullet points
- Use numbered lists (1. 2. 3.) for sequential steps

[Continue this pattern for all major topics in the lecture...]

## Summary

[Write a comprehensive 4-6 sentence summary of the entire lecture. This should capture the main ideas and their significance. A student should be able to read this summary and understand the key takeaways.]

FORMATTING RULES:
- Use ## for topic headings (these will be centered)
- Use **bold** for ALL key terms, definitions, and important concepts - these are highlighted for students
- Use bullet points (-) for lists of related items
- Use numbered lists (1. 2. 3.) for sequential steps or processes
- Keep paragraphs short (2-4 sentences max)
- Leave blank lines between sections for readability

CONTENT GUIDELINES:
- Extract and organize core concepts logically by topic
- Bold every important term, name, concept, or definition
- Explain so a student who missed the lecture can understand
- Do NOT invent information not in the lecture
- Write in clear, simple English
- Focus on making notes scannable - students should find key points quickly
- Create 3-8 topic sections depending on lecture length

The goal is READABILITY. Students should be able to scan these notes quickly and not miss any key points.`;

const PAID_SYSTEM_PROMPT = `You are an expert academic note-taking assistant that creates clear, easy-to-read study notes with practice questions.

Your task: Transform a raw lecture transcript into well-organized study notes that are easy to read and help students grasp key concepts quickly.

OUTPUT FORMAT (YOU MUST FOLLOW THIS EXACTLY):

# [Lecture Title Based on Content]

## [First Major Topic]

[Clear explanation of this topic in 2-4 sentences. Make it easy to understand.]

- **[Key Term 1]**: Definition or explanation
- **[Key Term 2]**: Definition or explanation
- **[Key Term 3]**: Definition or explanation

[Additional context or examples if needed]

## [Second Major Topic]

[Clear explanation of this topic]

- **[Key Term]**: Definition or explanation
- Important points as bullet points
- Use numbered lists (1. 2. 3.) for sequential steps

[Continue this pattern for all major topics in the lecture...]

## Summary

[Write a comprehensive 4-6 sentence summary of the entire lecture. This should capture the main ideas and their significance.]

## Practice Questions

**Question 1:** What is [concept]?

A) Option A
B) Option B
C) Option C
D) Option D

**Question 2:** [Continue for 10-15 questions total, mixing easy/medium/hard difficulty]

---

**Answer Key:**
1. A
2. B
[etc.]

FORMATTING RULES:
- Use ## for topic headings (these will be centered)
- Use **bold** for ALL key terms, definitions, and important concepts - these are highlighted for students
- Use bullet points (-) for lists of related items
- Use numbered lists (1. 2. 3.) for sequential steps or processes
- Keep paragraphs short (2-4 sentences max)
- Leave blank lines between sections for readability

CONTENT GUIDELINES:
- Extract and organize core concepts logically by topic
- Bold every important term, name, concept, or definition
- Explain so a student who missed the lecture can understand
- Do NOT invent information not in the lecture
- Write in clear, simple English
- Focus on making notes scannable - students should find key points quickly
- Create 3-8 topic sections depending on lecture length

The goal is READABILITY. Students should be able to scan these notes quickly and not miss any key points.`;

const DOCUMENT_SUMMARY_PROMPT = `You are an expert academic assistant that creates comprehensive study summaries from documents.

Your task: Transform the extracted text from a document (PDF, slides, etc.) into a well-organized study summary that helps students understand and retain the material.

OUTPUT FORMAT (YOU MUST FOLLOW THIS EXACTLY):

# [Document Title Based on Content]

## Overview

[Write a 2-3 sentence overview of what this document covers and its main purpose.]

## Key Concepts

### [First Major Concept]

[Clear explanation in 2-4 sentences]

- **[Key Term 1]**: Definition or explanation
- **[Key Term 2]**: Definition or explanation

### [Second Major Concept]

[Clear explanation in 2-4 sentences]

- **[Key Term]**: Definition or explanation
- Important points as bullet points

[Continue for all major concepts...]

## Important Details

- **[Detail 1]**: Explanation
- **[Detail 2]**: Explanation
[List 5-10 important details, facts, or formulas from the document]

## Summary

[Write a comprehensive 4-6 sentence summary of the entire document. A student should be able to read this and understand the key takeaways.]

FORMATTING RULES:
- Use ## for main section headings
- Use ### for subsection headings
- Use **bold** for ALL key terms, definitions, and important concepts
- Use bullet points (-) for lists
- Keep paragraphs short (2-4 sentences max)
- Leave blank lines between sections

CONTENT GUIDELINES:
- Extract and organize core concepts logically
- Bold every important term, name, concept, or definition
- Explain clearly so any student can understand
- Do NOT invent information not in the document
- Focus on making the summary scannable and useful for studying`;

const getFlashcardSystemPrompt = (difficulty: DifficultyLevel, quantity: number): string => {
  const difficultyGuidance = difficulty === 'easy'
    ? 'Focus on basic definitions and simple recall questions. Keep answers straightforward.'
    : difficulty === 'medium'
    ? 'Balance basic concepts with some application questions. Include relationships between concepts.'
    : 'Focus on complex concepts, analysis, and synthesis. Include questions that require deeper understanding.';

  return `You are an expert study assistant that creates effective flashcards for students.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyGuidance}

Your task: Create study flashcards from the content. Each flashcard should help students memorize and recall key concepts.

OUTPUT FORMAT (YOU MUST FOLLOW THIS EXACTLY - JSON array):

[
  {
    "front": "What is [key term or question]?",
    "back": "Clear, concise answer or definition (1-3 sentences max)"
  },
  {
    "front": "Define [important concept]",
    "back": "The definition with key details"
  }
]

FLASHCARD GUIDELINES:
- Create UP TO ${quantity} flashcards (fewer if the content doesn't support that many)
- All flashcards should be ${difficulty} difficulty level
- Front side: A clear question, term, or prompt
- Back side: Concise answer (1-3 sentences, easy to memorize)
- Cover the most important concepts from the content
- Mix different types: definitions, explanations, examples, comparisons
- Make answers specific and memorable, not vague
- Use simple language a student can quickly understand
- Focus on exam-worthy content

TYPES OF FLASHCARDS TO INCLUDE:
- Key term definitions (What is X?)
- Concept explanations (How does X work?)
- Comparisons (What is the difference between X and Y?)
- Examples (Give an example of X)
- Cause/effect (What causes X? What is the result of X?)

Return ONLY the JSON array, no other text.`;
};

// Keep the original static prompt for the lecture flashcards (backward compatibility)
const FLASHCARD_SYSTEM_PROMPT = getFlashcardSystemPrompt('medium', 15);

export async function generateFlashcards(transcript: string): Promise<{ front: string; back: string }[]> {
  console.log('[Anthropic] Starting flashcard generation...');
  console.log('[Anthropic] Transcript length:', transcript.length);

  try {
    const client = getClient();
    console.log('[Anthropic] Client created, calling API for flashcards...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Create 15 study flashcards from the following lecture content:\n\n${transcript}`,
        },
      ],
      system: FLASHCARD_SYSTEM_PROMPT,
    });

    console.log('[Anthropic] Flashcard API response received');

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude: ' + content.type);
    }

    // Parse the JSON response
    const flashcards = JSON.parse(content.text);

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Invalid flashcard response format');
    }

    console.log('[Anthropic] Flashcards generated successfully, count:', flashcards.length);
    return flashcards;
  } catch (error) {
    console.error('[Anthropic] Error generating flashcards:', error);
    throw error;
  }
}

export async function generateNotes(transcript: string, plan: 'free' | 'student' = 'free'): Promise<string> {
  console.log('[Anthropic] Starting note generation...');
  console.log('[Anthropic] Plan:', plan);
  console.log('[Anthropic] Transcript length:', transcript.length);

  const systemPrompt = plan === 'student' ? PAID_SYSTEM_PROMPT : FREE_SYSTEM_PROMPT;

  try {
    const client = getClient();
    console.log('[Anthropic] Client created, calling API...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Please convert the following lecture transcript into well-structured study notes:\n\n${transcript}`,
        },
      ],
      system: systemPrompt,
    });

    console.log('[Anthropic] API response received');
    console.log('[Anthropic] Stop reason:', message.stop_reason);
    console.log('[Anthropic] Content blocks:', message.content.length);

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude: ' + content.type);
    }

    console.log('[Anthropic] Notes generated successfully, length:', content.text.length);
    return content.text;
  } catch (error) {
    console.error('[Anthropic] Error generating notes:', error);
    throw error;
  }
}

export async function generateDocumentSummary(documentText: string): Promise<string> {
  console.log('[Anthropic] Starting document summary generation...');
  console.log('[Anthropic] Document text length:', documentText.length);

  try {
    const client = getClient();
    console.log('[Anthropic] Client created, calling API for document summary...');

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Please create a comprehensive study summary from the following document content:\n\n${documentText}`,
        },
      ],
      system: DOCUMENT_SUMMARY_PROMPT,
    });

    console.log('[Anthropic] Document summary API response received');
    console.log('[Anthropic] Stop reason:', message.stop_reason);

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude: ' + content.type);
    }

    console.log('[Anthropic] Document summary generated successfully, length:', content.text.length);
    return content.text;
  } catch (error) {
    console.error('[Anthropic] Error generating document summary:', error);
    throw error;
  }
}

import type { DifficultyLevel, MCQ, TrueFalseQuestion } from './types';

const getDifficultyDescription = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case 'easy':
      return 'Focus on basic recall and simple concepts. Questions should test fundamental understanding and be straightforward. Avoid tricky wording or complex scenarios.';
    case 'medium':
      return 'Balance between recall and application. Include questions that require understanding relationships between concepts and some analysis.';
    case 'hard':
      return 'Focus on analysis, application, and critical thinking. Include questions that require synthesizing multiple concepts, evaluating scenarios, and solving complex problems.';
  }
};

const getMCQSystemPrompt = (difficulty: DifficultyLevel, quantity: number): string => `You are an expert exam question creator. Create multiple choice questions (MCQs) from the provided document content.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${getDifficultyDescription(difficulty)}

OUTPUT FORMAT (YOU MUST RETURN VALID JSON - NO OTHER TEXT):

[
  {
    "question": "What is the main purpose of [concept]?",
    "options": [
      { "label": "A", "text": "First option text" },
      { "label": "B", "text": "Second option text" },
      { "label": "C", "text": "Third option text" },
      { "label": "D", "text": "Fourth option text" }
    ],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why A is correct and why other options are incorrect."
  }
]

GUIDELINES:
- Create UP TO ${quantity} MCQs (fewer if the document doesn't have enough content)
- All questions should be ${difficulty} difficulty level
- Each question MUST have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Include clear explanations for why the correct answer is right
- Cover the main concepts from the document
- Questions should test understanding appropriate to the difficulty level
- Avoid "All of the above" or "None of the above" options
- Return ONLY the JSON array, no markdown, no additional text`;

const getQuizSystemPrompt = (difficulty: DifficultyLevel, quantity: number): string => `You are an expert educator creating True/False practice questions for memorization and quick recall.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${getDifficultyDescription(difficulty)}

OUTPUT FORMAT (YOU MUST RETURN VALID JSON - NO OTHER TEXT):

[
  {
    "statement": "A clear statement about a concept that is either true or false",
    "correctAnswer": true,
    "explanation": "Brief explanation of why this statement is true/false and what students should remember."
  },
  {
    "statement": "Another statement to evaluate",
    "correctAnswer": false,
    "explanation": "Explanation of why this is false and what the correct information is."
  }
]

GUIDELINES:
- Create UP TO ${quantity} True/False questions (fewer if document doesn't have enough content)
- All questions should be ${difficulty} difficulty level
- Make statements clear and unambiguous
- Mix of true and false answers (roughly 50/50)
- Cover the main concepts from the document
- Explanations should help students understand and memorize the correct information
- Avoid tricky wording or double negatives
- Focus on key facts, definitions, and concepts that are good for memorization
- Return ONLY the JSON array, no markdown, no additional text`;

export async function generateMCQs(
  documentText: string,
  difficulty: DifficultyLevel = 'medium',
  quantity: number = 25
): Promise<MCQ[]> {
  console.log('[Anthropic] Starting MCQ generation...');
  console.log('[Anthropic] Document text length:', documentText.length);
  console.log('[Anthropic] Difficulty:', difficulty, 'Quantity:', quantity);

  try {
    const client = getClient();

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: `Create ${difficulty} difficulty multiple choice questions from the following document content:\n\n${documentText}`,
        },
      ],
      system: getMCQSystemPrompt(difficulty, quantity),
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const mcqs = JSON.parse(content.text) as MCQ[];

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      throw new Error('Invalid MCQ response format');
    }

    console.log('[Anthropic] MCQs generated successfully, count:', mcqs.length);
    return mcqs;
  } catch (error) {
    console.error('[Anthropic] Error generating MCQs:', error);
    throw error;
  }
}

export async function generateQuiz(
  documentText: string,
  difficulty: DifficultyLevel = 'medium',
  quantity: number = 25
): Promise<TrueFalseQuestion[]> {
  console.log('[Anthropic] Starting quiz generation...');
  console.log('[Anthropic] Document text length:', documentText.length);
  console.log('[Anthropic] Difficulty:', difficulty, 'Quantity:', quantity);

  try {
    const client = getClient();

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Create ${difficulty} difficulty True/False practice questions from the following document content:\n\n${documentText}`,
        },
      ],
      system: getQuizSystemPrompt(difficulty, quantity),
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const quiz = JSON.parse(content.text) as TrueFalseQuestion[];

    if (!Array.isArray(quiz) || quiz.length === 0) {
      throw new Error('Invalid quiz response format');
    }

    console.log('[Anthropic] Quiz generated successfully, count:', quiz.length);
    return quiz;
  } catch (error) {
    console.error('[Anthropic] Error generating quiz:', error);
    throw error;
  }
}

export async function generateDocumentFlashcards(
  documentText: string,
  difficulty: DifficultyLevel = 'medium',
  quantity: number = 15
): Promise<{ front: string; back: string }[]> {
  console.log('[Anthropic] Starting document flashcard generation...');
  console.log('[Anthropic] Document text length:', documentText.length);
  console.log('[Anthropic] Difficulty:', difficulty, 'Quantity:', quantity);

  try {
    const client = getClient();

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Create ${difficulty} difficulty study flashcards from the following document content:\n\n${documentText}`,
        },
      ],
      system: getFlashcardSystemPrompt(difficulty, quantity),
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const flashcards = JSON.parse(content.text);

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Invalid flashcard response format');
    }

    console.log('[Anthropic] Document flashcards generated successfully, count:', flashcards.length);
    return flashcards;
  } catch (error) {
    console.error('[Anthropic] Error generating document flashcards:', error);
    throw error;
  }
}
