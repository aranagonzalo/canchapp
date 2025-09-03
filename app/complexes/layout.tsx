"use client";

import React from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

const layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS as string}>
                {children}
            </APIProvider>
        </div>
    );
};

export default layout;
