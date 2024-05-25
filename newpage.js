// Function to get URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const data = JSON.parse(getParameterByName('key1'));
// const data = [{"date":"5/25/2024","jobs":[{"datetime":"5/25/2024, 11:25:36 AM","job_link":"chrome://extensions/"},{"datetime":"5/25/2024, 11:26:11 AM","job_link":"chrome://extensions/"},{"datetime":"5/25/2024, 11:43:01 AM","job_link":"chrome://extensions/"}]}];

const tablesContainer = document.getElementById('tablesContainer');

data.forEach((element, index) => {
  const table = document.createElement('table');
  table.className = 'table table-bordered mt-4';

  const headerRow = table.insertRow();
  const headerCell1 = headerRow.insertCell(0);
  const headerCell2 = headerRow.insertCell(1);
  const headerCell3 = headerRow.insertCell(2);

  headerCell1.innerHTML = 'Row Number';
  headerCell2.innerHTML = 'Datetime';
  headerCell3.innerHTML = 'Job Link';

  element.jobs.forEach((job, jobIndex) => {
    const row = table.insertRow();
    const rowNumberCell = row.insertCell(0);
    const datetimeCell = row.insertCell(1);
    const jobLinkCell = row.insertCell(2);

    rowNumberCell.innerHTML = jobIndex + 1;
    datetimeCell.innerHTML = job.datetime;

    const link = document.createElement('a');
    link.href = job.job_link;
    link.target = '_blank';
    link.innerHTML = job.job_link;
    jobLinkCell.appendChild(link);
  });

  const title = document.createElement('h5');
  title.innerText = `Table ${index + 1} - Date: ${element.date}`;

  tablesContainer.appendChild(title);
  tablesContainer.appendChild(table);
});



