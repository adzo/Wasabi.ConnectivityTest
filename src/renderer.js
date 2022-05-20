// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


const loader_text = document.querySelector('#loader-text');
const loader_content = document.querySelector('#loader');
const error_text = document.querySelector('#error-text');
const loader_spinner = document.querySelector('#loader-spinner');
const reload_btn = document.querySelector('#reload-btn');
const main_content = document.querySelector('#main-content');
const us_regions_container = document.querySelector('#us_regions_container');
const eu_regions_container = document.querySelector('#eu_regions_container');
const apac_regions_container = document.querySelector('#apac_regions_container');
const wasabi_tools_container = document.querySelector('#wasabi_tools_container');

const us_regions_prefix = ['us', 'ca'];
const eu_regions_prefix = ['eu', 'eu'];
const apac_regions_prefix = ['ap'];

certLoading = false;
pingLoading = false;
numberOfLoadedCertificates = 0;
numberOfLoadedPings = 0;

// UI Event creation
reload_btn.addEventListener('click', () => {
    loadAvailableRegions();
})

// 
//region Events Handling
window.api.receive("pingMeasured", (data) => {
    //TODO
    ////console.log("Ping measure")
    ////console.log(data);
    if (data.resolved && data.ping.stdout) {
        ping = parsePingResponse(data.ping, data.platform);
        setAvailablilityBadge(data.region, true, ping)
    } else {
        setAvailablilityBadge(data.region, false, 'N/A')
    }
    numberOfLoadedPings += 1;
    if (numberOfLoadedPings == loadedRegions.length + 3) {
        pingLoading = false;
    }
})

window.api.receive("getRegionCert", (data) => {
    region = data.region;
    certificate = data.cert;
    setIssuer(region, certificate.issuer.CN);
    validFrom = new Date(certificate.valid_from);
    validTo = new Date(certificate.valid_to);
    setValidFrom(region, `${validFrom.getFullYear()}/${validFrom.getMonth() + 1}/${validFrom.getDate()}`);
    setValidTo(region, `${validTo.getFullYear()}/${validTo.getMonth() + 1}/${validTo.getDate()}`);

    if (validTo > new Date()) {
        setCertificateValidation(region, true);
    } else {
        setCertificateValidation(region, false);
    }

    numberOfLoadedCertificates += 1;
    if (numberOfLoadedCertificates == loadedRegions.length + 3) {
        certLoading = false;
    }
})
//endregion

//Events Raising
function notifyMainProcess() {

    window.api.send("onRegionsLoaded", loadedRegions)
}


// utilities 
function pingURL() {
    var URL = $("#url").val();
    window.api.send("toMain", URL);
}

let loadedRegions = [];




function setupUi() {
    //setting up UI here

    main_content.classList.remove("hidden");
    loader_content.classList.add("hidden");

    loadedRegions.forEach(element => {
        addRegionToCorrespondingUiBlock(element);
        window.api.send("getRegionCert", element.Region)
    })
}

function addWasabiToolsEndpoints() {
    //add console
    loadedRegions.push({
        Region: 'console',
        RegionName: 'Web Console',
        Endpoint: 'console.wasabisys.com',
        Status: 'OK',
        IsDefault: false
    });
    //add IAM endpoint
    loadedRegions.push({
        Region: 'iam',
        RegionName: 'IAM (Identity Access Man...)',
        Endpoint: 'iam.wasabisys.com',
        Status: 'OK',
        IsDefault: false
    });
    // add sts endpoint
    loadedRegions.push({
        Region: 'sts',
        RegionName: 'STS (Security Token Service)',
        Endpoint: 'sts.wasabisys.com',
        Status: 'OK',
        IsDefault: false
    });
}

function loadAvailableRegions() {
    if (certLoading || pingLoading) {
        //console.log('old data still loading!')
        return;
    }

    numberOfLoadedCertificates = 0;
    numberOfLoadedPings = 0;
    clearUi();
    url = 'https://s3.wasabisys.com/?describeRegions';

    reload_btn.classList.add('hidden');
    error_text.textContent = '';
    //loader_spinner.classList.add("spinner-grow")

    $.ajax({
        type: "GET",
        dataType: 'xml',
        url: url,
        success: function (respData) {
            regions = []
            $(respData).find("item").each(function () {
                let item = this;
                let region = {
                    Region: $(item).find('Region').text(),
                    RegionName: $(item).find('RegionName').text(),
                    Endpoint: $(item).find('Endpoint').text(),
                    Status: $(item).find('Status').text(),
                    IsDefault: $(item).find('IsDefault').text()
                };

                regions.push(region);
            });

            if (regions && regions.length > 0) {
                loader_text.textContent = `Loaded ${regions.length} regions`;
            } else {
                loader_text.textContent = `No region was loaded`;
                return;
            }

            loadedRegions = regions;
            addWasabiToolsEndpoints();

            notifyMainProcess();
            setupUi();
        },
        error: function (request, status, error) {
            loader_text.textContent = `Counld not load any region`;
            error_text.textContent = status;
            loader_spinner.classList.remove("spinner-grow");
            reload_btn.classList.remove('hidden');
        }
    });
}

loadAvailableRegions()


containersVisibility = [];
containersVisibility['us_regions_container'] = true;
containersVisibility['eu_regions_container'] = true;
containersVisibility['apac_regions_container'] = true;
containersVisibility['wasabi_tools_container'] = true;

function toggleContainer(containerId) {
    if (containersVisibility[containerId]) {
        hide(containerId);
    } else {
        show(containerId);
    }
}

function show(containerId) {

    containerDrawer = document.getElementById(containerId);
    const reflow = containerDrawer.offsetHeight;

    // Trigger our CSS transition
    containerDrawer.classList.add('is-open');
    containerDrawer.classList.remove('hidden');
    containersVisibility[containerId] = true;

    btn = document.getElementById(`btn_${containerId}`);
    btn.classList.add('rotate-180')
}

const listener = (containerId) => {
    containerDrawer = document.getElementById(containerId);
    // drawer.setAttribute('hidden', true);
    containerDrawer.classList.add('hidden');
    // drawer.classList.add('is-open');

    containerDrawer.removeEventListener('transitionend', listener);
};

function hide(containerId) {
    containerDrawer = document.getElementById(containerId);
    containerDrawer.addEventListener('transitionend', listener(containerId));

    containerDrawer.classList.remove('is-open');

    containersVisibility[containerId] = false;

    btn = document.getElementById(`btn_${containerId}`);
    btn.classList.remove('rotate-180');
}

let autoReload = true;
const autoReloadCheckBox = document.getElementById('autoRefresh');
var refreshInterval;
autoReloadCheckBox.addEventListener('change', e => {
    autoReload = e.target.checked;
    if (autoReload) {
        countdown = 60;
        setAutomaticRefreshInterval();
    } else {
        const secondsSpan = document.getElementById('refreshMessage')
        secondsSpan.textContent = "Automatic refresh is disabled"
        if (refreshInterval) clearInterval(refreshInterval);
    }
})

function setAutomaticRefreshInterval() {
    refreshInterval = setInterval(() => {
        currentDate = new Date();
        passedSecond = Math.floor((currentDate - startingDate) / 1000);

        if (oldSecond !== passedSecond) {
            oldSecond = passedSecond

            decreaseSecondsCountdown()
            if (countdown == 0) {
                loadAvailableRegions();
            }
        }
    }, 250)
}

// autoRefresh.checked = true;


startingDate = new Date();
oldSecond = 0;



countdown = 60;
function decreaseSecondsCountdown() {
    const secondsSpan = document.getElementById('refreshMessage')

    if (countdown == 0) {
        countdown = 60;
    }

    countdown -= 1;
    secondsSpan.textContent = `Automatically refresh data in ${countdown} seconds`;
}

function manualReload() {
    countdown = 60;
    loadAvailableRegions();
}

setAutomaticRefreshInterval();

