/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import userEvent from '@testing-library/user-event';
import router from '../app/Router';

jest.mock('../app/Store', () => mockStore);

beforeEach(() => {
    //On simule la connection sur la page Employee en parametrant le localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem(
        'user',
        JSON.stringify({
            type: 'Employee',
            email: 'employee@test.tld',
        })
    );
    // Afficher la page nouvelle note de frais
    document.body.innerHTML = NewBillUI();
});

describe('NewBill Unit test suites', () => {
    describe('Given I am connected as an employee', () => {
        describe('When I am on NewBill page', () => {
            describe('When I try to load a picture', () => {
                test('Then file sould be an picture', () => {
                    // Récupération input file
                    const newFile = screen.getByTestId('file');
                    // Récupération de nouvelle instance de NewBill
                    const onNavigate = (pathname) =>
                        (document.body.innerHTML = ROUTES({ pathname }));
                    const newBillEmulation = new NewBill({
                        document,
                        onNavigate,
                        store: mockStore,
                        localStorage: window.localStorage,
                    });
                    const handleChangeFile = jest.fn((e) =>
                        newBillEmulation.handleChangeFile(e)
                    );
                    // addEventListener handleChangeFile
                    newFile.addEventListener('change', handleChangeFile);
                    userEvent.click(newFile);
                    //  Vérifié si le fichier est bien une image
                    fireEvent.change(newFile, {
                        target: {
                            files: [
                                new File(['(⌐□_□)'], 'chucknorris.png', {
                                    type: 'image/png',
                                }),
                            ],
                        },
                    });
                    expect(newFile.files[0].type).toMatch(
                        /(image\/jpg)|(image\/jpeg)|(image\/png)/gm
                    );
                });

                test('then file should not be an image', () => {
                    const jsdomAlert = window.alert;
                    window.alert = () => {};

                    // Récupération input file
                    const newFile = screen.getByTestId('file');
                    // Récupération de nouvelle instance de NewBill
                    const onNavigate = (pathname) =>
                        (document.body.innerHTML = ROUTES({ pathname }));
                    const newBillEmulation = new NewBill({
                        document,
                        onNavigate,
                        store: mockStore,
                        localStorage: window.localStorage,
                    });
                    const handleChangeFile = jest.fn((e) =>
                        newBillEmulation.handleChangeFile(e)
                    );
                    // addEventListener handleChangeFile
                    newFile.addEventListener('change', handleChangeFile);
                    userEvent.click(newFile);
                    //  Vérifié si le fichier est bien une image
                    fireEvent.change(newFile, {
                        target: {
                            files: [
                                new File(['(⌐□_□)'], 'chucknorris.txt', {
                                    type: 'text/plain',
                                }),
                            ],
                        },
                    });
                    expect(newFile.files[0].type).not.toMatch(
                        /(image\/jpg)|(image\/jpeg)|(image\/png)/gm
                    );
                    window.alert = jsdomAlert; // restore the jsdom alert
                });
            });
        });
    });
});

// TEST NewBill submit form
describe('NewBill Integration Test Suites', () => {
    describe('Given I am auser connected as an employee', () => {
        describe('When I am on NewBill', () => {
            test('Then I submit completed NewBill form and I am redirected on Bill, methode Post', async () => {
                // route
                document.body.innerHTML = `<div id="root"></div>`;
                router();
                window.onNavigate(ROUTES_PATH.NewBill);
                // value for Expense-name
                const expenseName = screen.getByTestId('expense-name');
                expenseName.value = 'vol';
                // value for Datepicker
                const datepicker = screen.getByTestId('datepicker');
                datepicker.value = '2022-07-25';
                // value for Amount
                const amount = screen.getByTestId('amount');
                amount.value = '250';
                // value for Vat
                const vat = screen.getByTestId('vat');
                vat.value = '30';
                // value for Pct
                const pct = screen.getByTestId('pct');
                pct.value = '40';
                // File and fireEvent
                const file = screen.getByTestId('file');
                fireEvent.change(file, {
                    target: {
                        files: [
                            new File(['(⌐□_□)'], 'chucknorris.png', {
                                type: 'image/png',
                            }),
                        ],
                    },
                });
                // Form Submission
                const formSubmission = screen.getByTestId('form-new-bill');
                const newBillEmulation = new NewBill({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                });

                const handleSubmit = jest.fn((e) =>
                    newBillEmulation.handleSubmit(e)
                );
                // addEventListener on form
                formSubmission.addEventListener('submit', handleSubmit);
                fireEvent.submit(formSubmission);
                expect(handleSubmit).toHaveBeenCalled();
                await waitFor(() => screen.getAllByText('Mes notes de frais'));
                expect(screen.getByTestId('btn-new-bill')).toBeTruthy();
            });
        });
    });
});

// test d'intégration POST
describe('Given I am a user connected as Employee and I am on NewBill page', () => {
    describe('When I submit the new bill', () => {
        test('create a new bill from mock API POST', async () => {
            const bill = [
                {
                    id: '47qAXb6fIm2zOKkLzMro',
                    vat: '80',
                    fileUrl:
                        'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
                    status: 'pending',
                    type: 'Hôtel et logement',
                    commentary: 'séminaire billed',
                    name: 'encore',
                    fileName: 'preview-facture-free-201801-pdf-1.jpg',
                    date: '2004-04-04',
                    amount: 400,
                    commentAdmin: 'ok',
                    email: 'a@a',
                    pct: 20,
                },
            ];
            const callStore = jest.spyOn(mockStore, 'bills');

            mockStore.bills().create(bill);

            expect(callStore).toHaveBeenCalled();
        });
    });
});
