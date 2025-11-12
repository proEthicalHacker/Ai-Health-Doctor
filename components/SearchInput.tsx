import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
    return (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </span>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="e.g., How to improve cardiovascular health?"
                    className="w-full pl-12 pr-5 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow duration-300 placeholder-slate-500"
                    disabled={isLoading}
                    aria-label="Health concern input"
                />
            </div>
            <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg hover:shadow-green-500/30"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : 'Generate Plan'}
            </button>
        </form>
    );
};

export default SearchInput;