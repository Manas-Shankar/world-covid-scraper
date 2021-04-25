const Apify = require('apify');
const sourceWorld = 'https://www.worldometers.info/coronavirus/?utm_campaign=homeAdvegas1?';   //link to scrape World COVID stats
const LATEST_WORLD = 'LATEST_WORLD';

Apify.main( async ()=>{

    // world statistics, following the same procedure as india stats

  const worldkvStore = await Apify.openKeyValueStore('COVID-19-WM');
  const world_dataset = await Apify.openDataset('COVID-19-WM-HISTORY');

  console.log('Launching Puppeteer...');
  const world_browser = await Apify.launchPuppeteer();

  const world_page = await world_browser.newPage();
  await Apify.utils.puppeteer.injectJQuery(world_page);

  console.log('Going to the world stats website...');
  await world_page.goto(sourceWorld, { waitUntil: 'networkidle0', timeout: 60000 });  

  console.log('Getting data...');
  const w_result = await world_page.evaluate(() => {
      let count=0;
      const regionsTableRows = Array.from(document.querySelectorAll("#main_table_countries_today > tbody > tr"));
      const regionData = [];
      // replace ALL , in the string, not only first occurence of ,
      const toInt = (a) => Number(a.replace(/,/g, ''))

      for (const row of regionsTableRows) {
          count+=1;
          const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent);
          regionData.push({ country: cells[1].trim(), totalCases: toInt(cells[2]), newCases: toInt(cells[3]), totalDeaths: toInt(cells[4]), newDeaths: toInt(cells[5]), totalRecovered: toInt(cells[6]), activeCases: toInt(cells[7]), seriousCritical: toInt(cells[8]), casesPerMil: toInt(cells[9]), deathsPerMil: toInt(cells[10]), totalTests: toInt(cells[11]), testsPerMil: toInt(cells[12]), population: toInt(cells[13]) });
          if(count===1)
          {break;}
      }

      const w_result = {
          regionData: regionData
      };
      return w_result;
  });
  console.log(w_result)
      let w_latest = await worldkvStore.getValue(LATEST_WORLD);
      if (!w_latest) {
          await worldkvStore.setValue('LATEST_WORLD', w_result);
          w_latest = w_result;
      }
      delete w_latest.lastUpdatedAtApify;
      const w_actual = Object.assign({}, w_result);
      delete w_actual.lastUpdatedAtApify;

      if (JSON.stringify(w_latest) !== JSON.stringify(w_actual)) {
          await world_dataset.pushData(w_result);
      }

      await worldkvStore.setValue('LATEST_WORLD', w_result);
      await Apify.pushData(w_result);



  console.log('Closing Puppeteer...');
  await world_browser.close();
  console.log('Done.');
   

});

// CODE WAS WRITTEN USING THE GITHUB REPO https://github.com/apify/covid-19






  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  