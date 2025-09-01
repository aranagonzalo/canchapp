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
            <APIProvider apiKey="AIzaSyBH5zGazn9Bl_I7tADSVsLZ3eEOEqP5MOU">
                {children}
            </APIProvider>
        </div>
    );
};

export default layout;
