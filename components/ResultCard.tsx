import React from 'react';

type IconType = 'info' | 'diet' | 'exercise';

interface ResultCardProps {
    title: string;
    icon: IconType;
    children: React.ReactNode;
}

const iconMap: Record<IconType, React.ReactElement> = {
    info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    diet: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>,
    exercise: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797zM15.362 5.214a.75.75 0 011.06.04l2.122 2.121a.75.75 0 01-.04 1.06l-2.12 2.122a.75.75 0 01-1.061-.041 8.25 8.25 0 01-1.06-1.061 8.25 8.25 0 011.06-1.06z" /></svg>,
};

const colorMap: Record<IconType, string> = {
    info: 'border-t-sky-500',
    diet: 'border-t-green-500',
    exercise: 'border-t-orange-500',
};


const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => {
    return (
        <div className={`bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg animate-fade-in border-t-4 ${colorMap[icon]}`}>
            <h2 className="text-2xl font-semibold text-slate-100 mb-4 flex items-center">
                {iconMap[icon]}
                {title}
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300">
                {children}
            </div>
        </div>
    );
};

export default ResultCard;