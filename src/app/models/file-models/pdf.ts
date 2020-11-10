import * as jsPDF from 'jspdf'
import { Selection } from 'd3'
import 'jspdf-autotable'
import canvg from 'canvg'
import { ErrorHelper } from 'app/utilities/error-helper'


export class PDF {
  _jsPDF: jsPDF.jsPDF
  _lastElementY: number
  _fontSize: number

  constructor(private verticalMargin: number = 5, private horizontalMargin: number = 20) {
    this._jsPDF = new jsPDF.jsPDF()
    this._fontSize = this._jsPDF.getFontSize()
    this._lastElementY = 0
  }

  addImage(sourceSVGRef: any, targetCanvasRef: any, x0: number, y0: number, x1: number, y1: number) {
    console.log('Parsing SVG')
    let serializer = new XMLSerializer();
    let svgSerialized: string
    try {
      svgSerialized = serializer.serializeToString(sourceSVGRef);
    } catch (err) {
      throw ErrorHelper.handleError('during serialzation of SVG data', err)
    }


    // export image from vectorial to raster format
    console.log('SVG parsed. Writing to canvas.')
    try {
      canvg(targetCanvasRef, svgSerialized, { useCORS: true })
    } catch (err) {
      throw ErrorHelper.handleError('during export of SVG data to raster data', err)
    }

    let imData: any
    console.log('Canvas written. Exporting to PNG format.')
    try {
      imData = targetCanvasRef.toDataURL('img/png', 'high')
    } catch (err) {
      throw ErrorHelper.handleError('while parsing canvas ref', err)
    }
    console.log('PNG data written. Exporting to PDF')
    try {
      this._jsPDF.addImage(imData, 'png', x0, y0 + this._lastElementY, x1, y1 + this._lastElementY)
    } catch (err) {
      throw ErrorHelper.handleError('during exportation of canvas data to PDF document', err)
    }

    console.log('Exported to PDF.')
    this._lastElementY += y1 + this.verticalMargin
  }

  addTableFromObjects(headers: string[][], data: string[][]) {
    try {
      (this._jsPDF as any).autoTable({
        head: headers,
        body: data,
        startY: this._lastElementY,
      })
    } catch (err) {
      throw ErrorHelper.handleError('while adding table to PDF document', err)
    }
    this._lastElementY = (this._jsPDF as any).lastAutoTable.finalY + this.verticalMargin
  }

  addTableFromHTMLRef(htmlRef: string) {
    try {
      (this._jsPDF as any).autoTable({
        html: htmlRef,
        startY: this._lastElementY,
      })
    } catch (err) {
      throw ErrorHelper.handleError('while adding table to PDF document from HTML reference', err)
    }
    this._lastElementY = (this._jsPDF as any).lastAutoTable.finalY + this.verticalMargin
  }

  addOneLineText(txt: string) {
    this._jsPDF.text(txt, this.horizontalMargin, this._lastElementY)
    this._lastElementY += this._fontSize + this.verticalMargin
  }

  export(fileName: string) {
    try {
      this._jsPDF.save(fileName)
    } catch (err) {
      throw ErrorHelper.handleError('while saving PDF file', err)
    }
  }
}