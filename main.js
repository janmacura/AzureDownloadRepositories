const apiVersion = "api-version=7.1";

var organization = "";
var project = "";
var personalAccessToken = "";
var authHeader = "";

const downloadRepositories = async () => {
    const repositories = await getRepos();
    //console.log(repositories);
    for (const repo of repositories) {
        if (repo.isFork) {
            console.log("skipping, because is fork: " + repo.name);
        } else if (repo.isDisabled) {
            console.log("skipping, because is disabled: " + repo.name);
        } else {
            await downloadRepositoryZip(repo);
        }
    }
    hideLoading();
}

const getRepos = async () => {
    const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories?${apiVersion}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const data = await response.json();
        console.log(data);
        return data.value;

    } catch (error) {
        console.error('Error fetching repositories:', error);
    }
};

const downloadRepositoryZip = async (repo) => {
    const id = repo.id;
    const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${id}/items?scopePath=/&$format=zip&download=true&${apiVersion}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download repository zip');
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${repo.name}.zip`;
        a.click();
        URL.revokeObjectURL(blobUrl);

    } catch (error) {
        console.error('Error downloading repository:', error);
    }
};

const downloadButtonClicked = function () {
    project = document.getElementById("projectName").value;
    personalAccessToken = document.getElementById("PATtoken").value;
    organization = document.getElementById("organization").value;

    if (organization !== "" && project !== "" && personalAccessToken !== "") {
        authHeader = 'Basic ' + btoa(':' + personalAccessToken);
        showLoading();
        downloadRepositories();
    } else {
        alert("All the inputs are mandatory, please check if you provided correct values.");
    }
}

const showLoading = function () {
    var x = document.getElementById("loading");
    x.style.display = "block";
}

const hideLoading = function () {
    var x = document.getElementById("loading");
    x.style.display = "none";
}

window.onload = (event) => {
    document.getElementById("downloadButton").addEventListener("click", (downloadButtonClicked));
};

