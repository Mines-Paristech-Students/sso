import React from 'react';

type Props = {
    title: string,
    children?: any,
};


export default function MainContainer(props: Props) {
    return (
        <div className="MainContainer">
            <h1>{props.title}</h1>

            <div className="content">
                {props.children}
            </div>
        </div>
    )
}
