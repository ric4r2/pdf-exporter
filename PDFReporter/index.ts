import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { PdfExportButton, type IPdfExportButtonProps } from "./PdfExportButton";
import * as React from "react";

export class PDFReporter implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;

    /**
     * Empty constructor.
     */
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

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const { width, height } = context.mode.allocatedHeight !== -1 && context.mode.allocatedWidth !== -1
            ? { width: context.mode.allocatedWidth, height: context.mode.allocatedHeight }
            : { width: undefined, height: undefined };

        const props: IPdfExportButtonProps = {
            tableData: context.parameters.tableData?.raw ?? undefined,
            buttonText: context.parameters.buttonText?.raw ?? undefined,
            buttonColor: context.parameters.buttonColor?.raw ?? undefined,
            buttonTextColor: context.parameters.buttonTextColor?.raw ?? undefined,
            buttonFontSize: context.parameters.buttonFontSize?.raw ?? undefined,
            buttonBorderRadius: context.parameters.buttonBorderRadius?.raw ?? undefined,
            pdfFileName: context.parameters.pdfFileName?.raw ?? undefined,
            pdfTitle: context.parameters.pdfTitle?.raw ?? undefined,
            pdfSubtitle: context.parameters.pdfSubtitle?.raw ?? undefined,
            pdfLogo: context.parameters.pdfLogo?.raw ?? undefined,
            pdfFootnote: context.parameters.pdfFootnote?.raw ?? undefined,
            openInNewTab: context.parameters.openInNewTab?.raw ?? true,
            autoDownload: context.parameters.autoDownload?.raw ?? true
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

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return { };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
