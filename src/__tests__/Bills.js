import { screen, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Firestore from "../app/Firestore"
import Router from "../app/Router"
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      Router();
      expect(
        screen.getByTestId("icon-window").classList.contains("active-icon")
      ).toBe(true);
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('When I am on Bills Page and it is loading', () => {
    test('Then, a `Loading...` message should be displayed', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page and an error occurs', () => {
    test('Then, an `Error` message should be displayed', () => {
      const html = BillsUI({ error: 'Error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  
  ////TEST FOR ICON EYE
  describe('When I am on the Bills page and click on the eye icon', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = BillsUI({ data: bills })

      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      const firestore = null

      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      
      const handleClickIconEye = jest.fn(() =>
        allBills.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener("click", handleClickIconEye)
      fireEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modal = document.getElementById("modaleFile")
      expect(modal).toBeTruthy()
    })
  })

  ////TEST FOR handleCickNewBill
  describe("Given I am on Bills page and I click on the New Bill button", () => {
    test("Then, it should display the NewBill page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };
      const firestore = null
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })

      const handleClickNewBill = jest.fn(allBills.handleClickNewBill)
      const billBtn = screen.getByTestId("btn-new-bill")
      billBtn.addEventListener("click", handleClickNewBill)
      fireEvent.click(billBtn)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
