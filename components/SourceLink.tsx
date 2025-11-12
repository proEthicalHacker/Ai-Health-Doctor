
import React from 'react';
import { GroundingChunk } from '../types';

interface SourceLinkProps {
    source: GroundingChunk;
}

const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
    if (!source.web) {
        return null;
    }

    const { uri, title } = source.web;

    return (
        <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors duration-200 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-slate-300 group-hover:text-green-400 truncate text-sm">
                {title || uri}
            </span>
        </a>
    );
};

export default SourceLink;
