import React from 'react';

import MobileShell from '../components/MobileShell'

const DashboardPage = () => {
    // We will add logic here later to check if the user is logged in
    // and to fetch user data.
    return (
        <MobileShell title="Dashboard">
            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-2 text-sm">Welcome to your money tracker!</p>
            </div>
        </MobileShell>
    );
};

export default DashboardPage;