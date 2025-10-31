import { ErrorCodes, WarningCodes } from "../console-codes";

import { FluexGLAudio } from "../index";

export namespace Debug {

    export function Log(message: string, additionalDetails?: string[]) {

        if (!FluexGLAudio.options.debugger.showInfo) return;

        let outputString: string = `%c[INFO]: %c${message} %c`;

        additionalDetails && additionalDetails.forEach(function (detail: string) {
            outputString += `\n\u0009  > ${detail}`
        });

        return console.log(outputString, "color: white;", "color: gray", "color: gray");
    }

    export function Success(message: string, additionalDetails?: string[]) {

        if (!FluexGLAudio.options.debugger.showInfo) return;

        let outputString: string = `%c[SUCCESS]: %c${message} %c`;

        additionalDetails && additionalDetails.forEach(function (detail: string) {
            outputString += `\n\u0009  > ${detail}`
        });

        return console.log(outputString, "color: lime;", "color: white", "color: gray");
    }

    export function Warn(message: string, additionalDetails?: string[], warningCode?: WarningCodes) {

        if (!FluexGLAudio.options.debugger.showWarnings) return;

        let outputString: string = `%c(${warningCode ? warningCode : "Unknown".toUpperCase()}) %c[WARNING]: %c${message} %c`;

        (additionalDetails && additionalDetails !== null) && additionalDetails.forEach(function (detail: string) {
            outputString += `\n\u0009  > ${detail}`
        });

        return console.log(outputString, "color: gray", "color: yellow;", "color: white", "color: white; font-style: italic;");
    }

    export function Error(message: string, additionalDetails?: string[], errorCode?: ErrorCodes) {

        if (!FluexGLAudio.options.debugger.showErrors) return;

        let outputString: string = `%c(${errorCode ? errorCode : "Unknown".toUpperCase()}) %c[ERROR]: %c${message} %c`;

        (additionalDetails && additionalDetails !== null) && additionalDetails.forEach(function (detail: string) {
            outputString += `\n\u0009  > ${detail}`
        });

        console.log(outputString, "color: red", "color: red;", "color: white", "color: white; font-style: italic;");

        if (FluexGLAudio.options.debugger.breakOnError) {

            for (let char of message)
                outputString = outputString.replace("%c", "");

            throw new window.Error(outputString);
        }
    }
}