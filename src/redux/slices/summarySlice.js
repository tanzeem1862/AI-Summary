import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateSummary = createAsyncThunk(
  'summary/generate',
  async ({ text, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
                    You are a professional summarization engine.

                    TASK:
                    Return EXACTLY 5 bullet points as a JSON array of 5 full sentences.
                    Each bullet MUST be a complete sentence.
                    DO NOT return fewer than 5 bullets.
                    DO NOT stop early.
                    DO NOT add commentary.
                    DO NOT return markdown.
                    DO NOT return partial sentences.

                    FORMAT:
                    {
                    "bullets": [
                        "Sentence 1.",
                        "Sentence 2.",
                        "Sentence 3.",
                        "Sentence 4.",
                        "Sentence 5."
                    ]
                    }

                    TEXT TO SUMMARIZE:
                    ${text}

                    Now return ONLY valid JSON.
                    `
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000, 
              topK: 50,
              topP: 0.9,
              candidateCount: 1,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to generate summary');
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from API');
      }

      const candidate = data.candidates[0];
      
      let summary = '';
      if (candidate.content?.parts) {
        summary = candidate.content.parts
          .map(part => part.text || '')
          .join('')
          .trim();
      }
      
      if (!summary) {
        throw new Error('Empty summary received');
      }
      
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('⚠️ WARNING: Response was truncated due to token limit!');
      } else if (candidate.finishReason !== 'STOP') {
        console.warn('⚠️ WARNING: Unexpected finish reason:', candidate.finishReason);
      }
      
      await addDoc(collection(db, 'summaries'), {
        userId,
        originalText: text,
        summary,
        timestamp: new Date().toISOString()
      });

    let parsed;
    try {
    parsed = JSON.parse(summary);
    } catch (e) {
    throw new Error("Gemini returned invalid JSON");
    }

    if (!parsed.bullets || !Array.isArray(parsed.bullets) || parsed.bullets.length !== 5) {
    throw new Error("Model did not return exactly 5 bullet points");
    }

    return { text, summary: parsed.bullets };    
    } catch (error) {
      console.error('=== SUMMARY GENERATION ERROR ===');
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    currentText: '',
    currentSummary: [],
    loading: false,
    error: null,
  },
  reducers: {
    setText: (state, action) => {
      state.currentText = action.payload;
    },
    clearSummary: (state) => {
      state.currentText = '';
      state.currentSummary = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSummary = action.payload.summary;
    })
      .addCase(generateSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setText, clearSummary } = summarySlice.actions;
export default summarySlice.reducer;