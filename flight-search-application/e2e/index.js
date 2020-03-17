import { Selector } from 'testcafe';

fixture `Getting Started`
  .page `localhost:4200`;

test('To show flight information for one-way flights', async t => {
  await t.maximizeWindow();
  const sourceField = await Selector('#source');
  await t.click(sourceField);
  const autoCompleted = await Selector('div.mat-autocomplete mat-option');
  await t.click(autoCompleted.nth(0));
  const destinationField = await Selector('#destination');
  await t.click(destinationField);
  await t.click(autoCompleted.nth(1));
  const departureDateField = await Selector('#departureDate');
  await t.typeText(departureDateField, '11/1/2020');
  const submitBtn = await Selector('#submit');
  await t.click(submitBtn);
  const oneWayItems = await Selector('app-flight-detail .one-way-flight').count;
  await t.expect(oneWayItems).eql(6);
});

test('To show flight information for return flights', async t => {
  await t.maximizeWindow();
  const returnRadioField = await Selector('#return');
  await t.click(returnRadioField);
  const sourceField = await Selector('#source');
  await t.click(sourceField);
  const autoCompleted = await Selector('div.mat-autocomplete mat-option');
  await t.click(autoCompleted.nth(0));
  const destinationField = await Selector('#destination');
  await t.click(destinationField);
  await t.click(autoCompleted.nth(1));
  const departureDateField = await Selector('#departureDate');
  await t.typeText(departureDateField, '11/1/2020');
  const returnDateField = await Selector('#returnDate');
  await t.typeText(returnDateField, '11/2/2020');
  const submitBtn = await Selector('#submit');
  await t.click(submitBtn);
  const oneWayItems = await Selector('app-flight-detail .one-way-flight').count;
  const returnItems = await Selector('app-flight-detail .return-flight').count;
  await t.expect(oneWayItems).eql(6);
  await t.expect(returnItems).eql(5);
});
