import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { PdfExportButton, type IPdfExportButtonProps } from "./PdfExportButton";
import * as React from "react";

export class PDFReporter implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;

    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const { width, height } = context.mode.allocatedHeight !== -1 && context.mode.allocatedWidth !== -1
            ? { width: context.mode.allocatedWidth, height: context.mode.allocatedHeight }
            : { width: undefined, height: undefined };

        const props: IPdfExportButtonProps = {
            pdfFileName: context.parameters.pdfFileName?.raw ?? undefined,
            pdfExportTitle: context.parameters.pdfExportTitle?.raw ?? undefined,
            pdfExportSubtitle: context.parameters.pdfExportSubtitle?.raw ?? undefined,
            sortingGroupingInfo: context.parameters.sortingGroupingInfo?.raw ?? undefined,
            logoBase64: context.parameters.logoBase64?.raw ?? undefined,
            landscapeOrientation: context.parameters.landscapeOrientation?.raw ?? undefined,
            linkTextColumn: context.parameters.linkTextColumn?.raw ?? undefined,
            linkUrlColumn: context.parameters.linkUrlColumn?.raw ?? undefined,
            pivotColumn: context.parameters.pivotColumn?.raw ?? undefined,
            aggFuncConfig: context.parameters.aggFuncConfig?.raw ?? undefined,
            apiUrl: context.parameters.apiUrl?.raw ?? undefined,
            columnConfig: context.parameters.columnConfig?.raw ?? undefined,
            columnGroups: context.parameters.columnGroups?.raw ?? undefined,
            headerFill: context.parameters.headerFill?.raw ?? undefined,
            headerColor: context.parameters.headerColor?.raw ?? undefined,
            fontSize: context.parameters.fontSize?.raw ?? undefined,
            fill: context.parameters.fill?.raw ?? undefined,
            color: context.parameters.color?.raw ?? undefined,
            borderColor: context.parameters.borderColor?.raw ?? undefined,
            borderThickness: context.parameters.borderThickness?.raw ?? undefined,
            borderRadius: context.parameters.borderRadius?.raw ?? undefined,
            buttonFontSize: context.parameters.buttonFontSize?.raw ?? undefined,
            buttonFontWeight: context.parameters.buttonFontWeight?.raw ?? undefined,
            hoverFill: context.parameters.hoverFill?.raw ?? undefined,
            hoverColor: context.parameters.hoverColor?.raw ?? undefined,
            hoverBorderColor: context.parameters.hoverBorderColor?.raw ?? undefined,
            pressedFill: context.parameters.pressedFill?.raw ?? undefined,
            pressedColor: context.parameters.pressedColor?.raw ?? undefined,
            pressedBorderColor: context.parameters.pressedBorderColor?.raw ?? undefined
        };

        return React.createElement(
            'div',
            {
                style: {
                    width: width ? `${width}px` : '100%',
                    height: height ? `${height}px` : '100%',
                    overflow: 'hidden'
                }
            },
            React.createElement(PdfExportButton, props)
        );
    }

    public getOutputs(): IOutputs {
        return { };
    }

    public destroy(): void {
        // Cleanup
    }
}
