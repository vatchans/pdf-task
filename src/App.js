import './App.css';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import Button from '@mui/material/Button';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import SaveIcon from '@mui/icons-material/Save';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  let [PDF_data, setdata] = useState([])
  let [loading, setLoading] = useState(false)

  let updatePdfWithFormFields = async (pdfData, formFieldUpdates) => {
    const pdfDoc = await PDFDocument.load(pdfData);
    const form = pdfDoc.getForm();
    for (const fieldName in formFieldUpdates) {
      if (form.getField(fieldName)) {
        const fieldValue = formFieldUpdates[fieldName];
        const field = form.getField(fieldName);
        if (typeof fieldValue === 'string') {
          field.setValue(fieldValue);
        } else if (typeof fieldValue === 'object') {
          field.setAppearanceProvider(new PDFName('N'), new PDFString(fieldValue));
        }
      }
    }

    return await pdfDoc.save();
  }



  let LoadPdf = async () => {
    try {
      let res = await axios.get('https://pdf-fs2y.onrender.com/users/pdf')
      if (res.status === 200 || 201) {
        setLoading(true)
        setdata(res.data)
      }
    }
    catch (err) {
      alert(err.response.data)
    }
  }

  let handleFormSubmit = async (formFieldUpdates) => {
    const updatedData = await updatePdfWithFormFields(`data:application/pdf;base64 ,${[PDF_data[0].Pdf]}`, formFieldUpdates);
    var blob = await new Blob([updatedData], { type: "application/pdf" });
    let updated = await convertToBase64(blob)
    saveAs(blob, "example.pdf");
    return updated.split(',').splice(1).join('')

  }

  let convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        resolve(fileReader.result)

      };
      fileReader.onerror = (error) => {
        reject(error)
      }

    })
  }

  let SavePDf = async () => {

    try {
      let data = await handleFormSubmit()
      let res = await axios.post('https://pdf-fs2y.onrender.com/users/save', {
        id: PDF_data[0]._id,
        Pdf: data,
      })
      if (res.status === 200) {
        toast.success(res.data)
      }
    }
    catch (error) {
      toast.error(error.response.data)
    }
  }

  return <>
    <div className='navbar'>
      <img src='pdf.png' ></img>
      Pdf viewer
    </div>

    <div className='container'>
      <div>
        <div className='button'>
          <><Button className="btn-grad" onClick={LoadPdf} style={{ width: "8rem", color: "white" }} >
            Load&nbsp;&nbsp;<DataSaverOffIcon />
          </Button></>
          <></><Button className="btn2-grad" onClick={SavePDf} style={{ width: "8rem", color: "white" }}>
            Save&nbsp;&nbsp;<SaveIcon />
          </Button>
        </div>
      </div>
    </div>
    {loading ? <div className='pdf'>
      <iframe src={`data:application/pdf;base64 ,${[PDF_data[0].Pdf]}`} width="70%" height="500px" />    </div> : <></>}
    <ToastContainer />
  </>
}

export default App;
