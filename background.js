chrome.runtime.onInstalled.addListener(() => {
    resetCounterDaily();
});

chrome.runtime.onStartup.addListener(() => {
    resetCounterDaily();
});

function resetCounterDaily() {
    chrome.storage.local.get(['counter', 'history'], (result) => {
        const today = new Date().toLocaleDateString();

        if (result.counter && result.counter.date !== today) {
        chrome.storage.local.set({ counter: { date: today, value: 0 } }, () => {
            const history = result.history || [];
            history.push({ date: result.counter.date, value: result.counter.value });
            chrome.storage.local.set({ history });
        });
        }
    });
}

function toggleDark () {
    if (!document.body.getAttribute('data-ext-dark')) {
        document.body.setAttribute('data-ext-dark', true);
        document.body.style.backgroundColor = '#000';
        document.body.style.color = '#fff';
    } else {
        document.body.setAttribute('data-ext-dark', false);
        document.body.style.backgroundColor = '#fff';
        document.body.style.color = '#000';
    }
}

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

chrome.commands.onCommand.addListener((command,tab) => {
    //do stuff here
    console.log(command + ": has been called");
    if (command === "increment") {
        updateCounter(1);
        chrome.action.setIcon({ path: "icons/applied.png" }); 
    } else if (command === "decrement") {
        updateCounter(-1);
        chrome.action.setIcon({ path: "icons/minus.png" }); 
    }
    
   
   setTimeout(() => {
        chrome.action.setIcon({ path: "icons/jobs.png" });
    }, 2000);
});