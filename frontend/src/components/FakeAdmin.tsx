import React, {useState} from 'react';
import Button from "react-bootstrap/Button";
import Heading from "./Heading";

export default function FakeAdmin() {
    /**
     * This is a troll.
     */

    const [buttonPushed, setButtonPushed] = useState<boolean>(false);

    return (
        <>
            <Heading heading="Administration"/>

            <Button variant="outline-danger"
                    onClick={() => setButtonPushed(true)}>
                Passer en maintenance
            </Button>

            {
                buttonPushed &&
                <div className="troll">
                    <span role="img" aria-label="émoticônes lol">😂😂😂</span>
                </div>
            }
        </>
    )
}
