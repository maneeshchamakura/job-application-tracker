// Function to open a new tab with the stored values
function openNewTabWithStorageValues() {
  // Retrieve values from chrome.storage
  chrome.storage.local.get(['jobs_history', 'history'], function(result) {
      // Construct the URL with query parameters
      let url = chrome.runtime.getURL("newpage.html") + 
      `?key1=${encodeURIComponent(JSON.stringify(result.jobs_history))}`;
      
      // Open the new tab
      chrome.tabs.create({ url: url });
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');
    const counterSpan = document.getElementById('counter');
    const historyBtn = document.getElementById('history');
    const historyListDiv = document.getElementById('history-list');
    document.getElementById('openNewPageButton').addEventListener('click', openNewTabWithStorageValues);

  
    chrome.storage.local.get(['counter', 'history'], (result) => {
      let today = new Date().toLocaleDateString();
      const counter = result.counter && result.counter.date === today ? result.counter.value : 0;
      counterSpan.textContent = counter;
    });
  
    incrementBtn.addEventListener('click', () => {
      updateCounter(1);
    });
  
    decrementBtn.addEventListener('click', () => {
      updateCounter(-1);
    });
  
    historyBtn.addEventListener('click', () => {
      chrome.storage.local.get(['history'], (result) => {
        const history = result.history || [];
        historyListDiv.innerHTML = history.map(entry => `<p>${entry.date}: ${entry.value}</p>`).join('');
      });
    });
  
chrome.runtime.onMessage.addListener((message) => {
    if (message.command === 'increment') {
    updateCounter(1);
    } else if (message.command === 'decrement') {
    updateCounter(-1);
    }
});

function getActiveTabUrl() {
  return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
          } else {
              resolve(tabs[0].url);
          }
      });
  });
}
  
function updateCounter(change) {
    chrome.storage.local.get(['counter', 'history', 'jobs_history'], async (result) => {
        let now = new Date();
        let today = now.toLocaleDateString();
        let datetime = now.toLocaleString();
        let counter = result.counter && result.counter.date === today ? result.counter.value : 0;
        counter += change;
        counter = Math.max(0, counter);  // Ensure counter doesn't go below 0

        chrome.storage.local.set({ counter: { date: today, value: counter } }, () => {
            counterSpan.textContent = counter;

            const history = result.history || [];
            const existingEntryIndex = history.findIndex(entry => entry.date === today);

            if (existingEntryIndex > -1) {
                history[existingEntryIndex].value = counter;
            } else {
                history.push({ date: today, value: counter });
            }

            chrome.storage.local.set({ history });
        });

        // append the current datetime and active tab link
        const jobs_history = result.jobs_history || [];
        console.log(jobs_history);
        const job_link = await getActiveTabUrl();
        console.log(job_link);
        const existingJobsIndex = jobs_history.findIndex(entry => entry.date === today);
        if (change > 0) {
          if (existingJobsIndex > -1) {
            jobs_history[existingJobsIndex].jobs.push({ job_link, datetime });
          } else {
            jobs_history.push({date: today, jobs: [{ job_link , datetime }]});
          }
        } else {
          if (existingJobsIndex > -1) {
            jobs_history[existingJobsIndex].jobs.pop();
          }
        }
        // set the jobs to local storage
        chrome.storage.local.set({ jobs_history });
    }); 
    }
  });
  