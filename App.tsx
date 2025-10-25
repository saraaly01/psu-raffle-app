import React, { useState, useEffect, useRef } from 'react';

// TypeScript declaration for the confetti function from the global scope
declare function confetti(options?: any): Promise<null> | null;

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L12 5" />
        <path d="M6 5L6 2" />
        <path d="M18 5L18 2" />
        <path d="M3 8L21 8" />
        <path d="M5 8V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V8" />
        <path d="M9 12L15 12" />
        <path d="M9 16L15 16" />
        <path d="M3 12H5" />
        <path d="M19 12H21" />
    </svg>
);

interface WinnerDisplayProps {
  winner: string;
  onReset: () => void;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, onReset }) => {
  return (
    <div className="w-full max-w-md text-center bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 transform transition-all animate-fade-in">
        <div className="flex justify-center items-center mb-6">
            <TrophyIcon />
        </div>
        <h2 className="text-2xl font-bold text-slate-300 mb-2">The winner is...</h2>
        <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 py-4 animate-pulse">
            {winner}
        </p>
        <div className="flex justify-center items-center gap-2 mt-4 mb-8">
            <StarIcon />
            <span className="text-lg font-medium text-yellow-400">Congratulations!</span>
            <StarIcon />
        </div>
        <button
            onClick={onReset}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-colors duration-300"
        >
            Start New Raffle
        </button>
    </div>
  );
};


export default function App() {
    const [namesInput, setNamesInput] = useState<string>('');
    const [winner, setWinner] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [drawingName, setDrawingName] = useState<string>('');
    const drawingIntervalRef = useRef<number | null>(null);

    const handleDraw = () => {
        setError(null);
        setWinner(null);

        const participants = namesInput.split('\n').map(name => name.trim()).filter(Boolean);

        if (participants.length < 2) {
            setError('Please enter at least two names to draw a winner.');
            return;
        }

        setIsDrawing(true);
        setDrawingName(participants[0]);

        let drawCount = 0;
        const totalDuration = 3000; // 3 seconds
        const initialInterval = 50; // ms

        drawingIntervalRef.current = window.setInterval(() => {
            drawCount++;
            const randomIndex = Math.floor(Math.random() * participants.length);
            setDrawingName(participants[randomIndex]);
            
            if (drawCount * initialInterval > totalDuration) {
                if (drawingIntervalRef.current) clearInterval(drawingIntervalRef.current);
                const finalWinnerIndex = Math.floor(Math.random() * participants.length);
                setWinner(participants[finalWinnerIndex]);
                setIsDrawing(false);
                setDrawingName('');
            }
        }, initialInterval);
    };

    const handleReset = () => {
        setNamesInput('');
        setWinner(null);
        setError(null);
        setIsDrawing(false);
    };

    useEffect(() => {
        return () => {
            if (drawingIntervalRef.current) {
                clearInterval(drawingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (winner && typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                zIndex: 1000,
            });
        }
    }, [winner]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
            <main className="w-full flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                            Raffle Winner Picker
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl">
                        Enter names below and click draw to see who wins the prize!
                    </p>
                </div>
                
                {winner ? (
                    <WinnerDisplay winner={winner} onReset={handleReset} />
                ) : (
                    <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                        <div className="mb-4">
                            <label htmlFor="names" className="block text-sm font-medium text-slate-300 mb-2">
                                Participant Names (one per line)
                            </label>
                            <textarea
                                id="names"
                                value={namesInput}
                                onChange={(e) => setNamesInput(e.target.value)}
                                placeholder="Alice&#10;Bob&#10;Charlie"
                                rows={8}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-200 placeholder-slate-500"
                                disabled={isDrawing}
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        
                        {isDrawing && (
                            <div className="text-center mb-4 p-4 h-20 flex items-center justify-center bg-slate-700 rounded-lg">
                                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 animate-pulse">
                                    {drawingName}
                                </p>
                            </div>
                        )}
                        
                        <button
                            onClick={handleDraw}
                            disabled={isDrawing}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-300"
                        >
                            {isDrawing ? 'Drawing...' : 'Draw Winner'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}