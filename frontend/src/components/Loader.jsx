import React from 'react';

function Loader() {
    return (
        <div className="flex justify-center items-center py-20">
            <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary-600/30"></div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
        </div>
    );
}

export default Loader;
