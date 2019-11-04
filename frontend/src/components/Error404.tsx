import React from 'react';
import {Link} from "react-router-dom";

export default function Error404() {
    return (
        <p>
            T’as essayé <Link to="/admin/">/admin/</Link> ?
        </p>
    );
}
