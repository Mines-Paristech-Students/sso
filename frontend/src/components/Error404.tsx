import React from 'react';
import {Link} from "react-router-dom";
import Heading from "./Heading";

export default function Error404() {
    return (
        <>
            <Heading heading="404."/>

            <p>
                T’as essayé <Link to="/admin/">/admin/</Link> ?
            </p>
        </>
    );
}
