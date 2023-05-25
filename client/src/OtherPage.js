import React from 'react';
import { Link } from 'react-router-dom';

// Define the OtherPage component
const OtherPage = () => {
    return (
        <div>
            I'm some other page!
            <Link to="/">Go back home</Link>
        </div>
    );
};

export default OtherPage;
