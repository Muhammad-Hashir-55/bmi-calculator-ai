import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BmiData {
    height: string;
    weight: string;
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    bmi: number | null;
    category: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AppState {
    // BMI State
    bmiData: BmiData;
    setBmiData: (data: Partial<BmiData>) => void;
    calculateBmi: () => void;

    // Chat State
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    setMessages: (msgs: ChatMessage[]) => void;
    isTyping: boolean;
    setIsTyping: (status: boolean) => void;

    // Game State
    gameScore: number;
    highScore: number;
    setGameScore: (score: number | ((prev: number) => number)) => void;
    setHighScore: (score: number) => void;

    // Config
    apiProvider: 'openrouter' | 'groq' | 'openai';
    apiKey: string;
    setApiConfig: (provider: AppState['apiProvider'], key: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // BMI State
            bmiData: {
                height: '',
                weight: '',
                age: '',
                gender: '',
                bmi: null,
                category: '',
            },
            setBmiData: (data) =>
                set((state) => ({ bmiData: { ...state.bmiData, ...data } })),
            calculateBmi: () => {
                const { height, weight } = get().bmiData;
                const h = parseFloat(height);
                const w = parseFloat(weight);
                if (h > 0 && w > 0) {
                    // Assuming height is in cm and weight in kg
                    const heightInMeters = h / 100;
                    const bmi = w / (heightInMeters * heightInMeters);

                    let category = '';
                    if (bmi < 18.5) category = 'Underweight';
                    else if (bmi < 25) category = 'Normal';
                    else if (bmi < 30) category = 'Overweight';
                    else category = 'Obese';

                    set((state) => ({
                        bmiData: { ...state.bmiData, bmi: parseFloat(bmi.toFixed(1)), category },
                    }));
                }
            },

            // Chat State
            messages: [
                {
                    id: '1',
                    role: 'assistant',
                    content: 'Hi! I am your AI Health Assistant. How can I help you today?',
                }
            ],
            addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
            setMessages: (msgs) => set({ messages: msgs }),
            isTyping: false,
            setIsTyping: (status) => set({ isTyping: status }),

            // Game State
            gameScore: 0,
            highScore: 0,
            setGameScore: (score) => set((state) => ({
                gameScore: typeof score === 'function' ? score(state.gameScore) : score
            })),
            setHighScore: (score) => set({ highScore: score }),

            // Config State
            apiProvider: 'openrouter',
            apiKey: '',
            setApiConfig: (provider, key) => set({ apiProvider: provider, apiKey: key }),
        }),
        {
            name: 'bmi-ai-app-storage',
            partialize: (state) => ({
                highScore: state.highScore,
                apiProvider: state.apiProvider,
                apiKey: state.apiKey,
                bmiData: state.bmiData,
            }),
        }
    )
);
