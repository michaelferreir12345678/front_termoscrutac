import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Route, Switch } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import { AppTopbar } from "./AppTopbar";
import { AppFooter } from "./AppFooter";
import { AppConfig } from "./AppConfig";
import 'bootstrap/dist/css/bootstrap.min.css';

import PrimeReact from "primereact/api";
import { Tooltip } from "primereact/tooltip";

import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/demo/flags/flags.css";
import "./assets/demo/Demos.scss";
import "./assets/layout/layout.scss";
import "./App.scss";
import UploadPage from "./components/UploadFile";

const App = () => {
    const [layoutColorMode, setLayoutColorMode] = useState("light");
    const [inputStyle, setInputStyle] = useState("outlined");
    const [ripple, setRipple] = useState(true);
    const copyTooltipRef = useRef();

    PrimeReact.ripple = true;

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onColorModeChange = (mode) => {
        setLayoutColorMode(mode);
    };

    const wrapperClass = classNames("layout-wrapper", "d-flex", "flex-column", "align-items-center", "justify-content-center", {
        "layout-theme-light": layoutColorMode === "light",
    });

    return (
        <div className={wrapperClass} style={{ minHeight: "100vh", textAlign: "center" }}>
            <Tooltip ref={copyTooltipRef} target=".block-action-copy" position="bottom" content="Copied to clipboard" event="focus" />

            <AppTopbar layoutColorMode={layoutColorMode} />

            <div className="layout-main-container">
                <div className="layout-main">
                    <Switch>
                        <Route path="/" component={UploadPage} />
                    </Switch>
                </div>
                <AppFooter layoutColorMode={layoutColorMode} />
            </div>

            <AppConfig 
                rippleEffect={ripple} 
                onRippleEffect={onRipple} 
                inputStyle={inputStyle} 
                onInputStyleChange={onInputStyleChange} 
                layoutColorMode={layoutColorMode} 
                onColorModeChange={onColorModeChange} 
            />

            <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={false} unmountOnExit>
                <div className="layout-mask p-component-overlay"></div>
            </CSSTransition>
        </div>
    );
};

export default App;
