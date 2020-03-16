import { Selector } from 'testcafe';

fixture `Getting Started`
  .page `localhost:4200`;

test('To show beer group by - Country', async t => {
  await t.maximizeWindow();
  const accordianItems = await Selector('mat-expansion-panel');
  const count = await Selector('mat-expansion-panel').count;
  const groupByValue = await Selector('mat-select').textContent;
  for(let i=0; i<count; i++){
    await t.click(accordianItems.nth(i))
  }
  await t.expect(groupByValue).eql('Country');
  await t.expect(count).eql(3);
});

test('To show beer group by - location', async t => {
  await t.maximizeWindow()
  const groupByFiled = await Selector('mat-select');
  await t.click(groupByFiled);
  const groupbyItems = await Selector('mat-option');
  await t.click(groupbyItems.nth(1));
  const groupByValue = await Selector('mat-select').textContent;
  await t.expect(groupByValue).eql('Location Type');
  const accordianItems = await Selector('mat-expansion-panel');
  const count = await Selector('mat-expansion-panel').count;
  for(let i=0; i<count; i++){
    await t.click(accordianItems.nth(i)) //click each link
  }
  await t.expect(count).eql(7);
});

test('Filter based on beer name', async t => {
  await t.maximizeWindow();
  const filterField = await Selector('#filterFiled');
  await t.typeText(filterField, 'Miller');
  const count = await Selector('mat-expansion-panel').count;
  const accordianItems = await Selector('mat-expansion-panel');
  await t.wait(500);
  for(let i=0; i<count; i++){
    const disabledValue = await accordianItems.nth(i).getAttribute('ng-reflect-disabled');
    if(disabledValue === 'false') {
      await t.click(accordianItems.nth(i))
    }
  }
});

test('Display Beer Details', async t => {
  await t.maximizeWindow();
  const accordianItems = await Selector('mat-expansion-panel');
  await t.click(accordianItems.nth(0));
  const gridRows = await Selector('ag-grid-angular#BE  div.ag-center-cols-container div').withAttribute('role', 'row');
  const gridRowsCount = await Selector('ag-grid-angular#BE div.ag-center-cols-container div').withAttribute('role', 'row').count;
  for(let i=0; i<gridRowsCount; i++){
    await t.click(gridRows.nth(i));
  }
});
