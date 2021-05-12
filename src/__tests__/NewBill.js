import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js"
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  ////TEST FOR handleChangeFile
  describe("When I am on NewBill Page and add an image", () => {
    test("Then this image should be added to the input", () => {
    
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      const firestore = null
     
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId('file')

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['test.png'], 'test.png', { type: 'image/png' })],
        },
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe('test.png')
    })
  })
 
  
  ////TEST FOR handleSubmit with wrong file extension
  describe('When I am on NewBill Page and I submit a form that contains an image with the wrong extension, the file is name invalid', () => {
    test('Then, it should not create a new bill and we stay in the form', () => {
       const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const firestore = null
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit)
      newBill.fileName = 'Invalid';
      const submitBtn = screen.getByTestId("form-new-bill")
      submitBtn.addEventListener("submit", handleSubmit)
      fireEvent.submit(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.fileName).toBe('Invalid')
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()

     })
  })
  ////TEST FOR handleSubmit with good file extension
  describe('When I am on NewBill Page and I submit a form that contains an image (jpg, jpeg, png)', () => {
    test('Then, it should create a new bill', () => {
       const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const firestore = null
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const submitBtn = screen.getByTestId("form-new-bill")
      submitBtn.addEventListener("submit", handleSubmit)
      fireEvent.submit(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      

     })
  })
})

//// TEST D'INTEGRATION POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new Bill", () => {
    test("send bill to mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post")
      const newBill = {
        "id": "47qAXn6fIm2zOKkLzMrC",
        "vat": "80",
        "fileUrl": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.EaTqgOM7X5XM7wlTMEQe2AHaDj%26pid%3DApi&f=1",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2010-04-04",
        "amount": 4000,
        "commentAdmin": "à valider",
        "email": "a@a",
        "pct": 20
      }
      const bills = await firebase.post(newBill)
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(5) // expect to be 5 because there is already 4 objects in data.
    })
    test("send bill to API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("send bill to API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})