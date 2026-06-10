import React from 'react';

const MegaphoneIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.99 18a2 2 0 002-2v-3.335a12.748 12.748 0 014.268-3.326 1 1 0 10-.936-1.78l-1.95.817a1.992 1.992 0 00-1.382 1.85V16a2 2 0 00-2 2H2a1 1 0 00-1 1v1a1 1 0 001 1h7.99zM2 11V9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1zm5 4H5v-2h2v2zm3-4h-2V9h2v2zm5.707-1.707a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 101.414 1.414l1.414-1.414zM16 11a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
);

export default MegaphoneIcon;