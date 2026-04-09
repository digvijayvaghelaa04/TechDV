import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <span className="text-8xl mb-4 animate-bounce">🛸</span>
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md">The page you are looking for has drifted into deep space.</p>
            <Link to="/" className="px-8 py-3 bg-primary-600 rounded-2xl font-bold text-foreground hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20">
                Return to Base
            </Link>
        </div>
    );
}

export default NotFound;
