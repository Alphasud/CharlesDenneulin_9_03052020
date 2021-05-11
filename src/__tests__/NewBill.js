import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js"

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