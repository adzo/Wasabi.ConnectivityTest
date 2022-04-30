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

// UI Event creation
reload_btn.addEventListener('click', () => {
    loadAvailableRegions();
})

// 
//region Events Handling
window.api.receive("pingMeasured", (data) => {
    //TODO
    //console.log("Ping measure")
    //console.log(data);
    if (data.resolved && data.ping.stdout) {
        ping = parsePingResponse(data.ping);
        setAvailablilityBadge(data.region, true, ping)
    } else {
        setAvailablilityBadge(data.region, false, 'N/A')
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
})
//endregion

//Events Raising
function notifyMainProcess() {
    // loadedRegions.push({
    //     Region: 'ap-BAD-1',
    //     RegionName: 'expired.badssl',
    //     Endpoint: 'expired.badssl.com',
    //     Status: 'OK',
    //     IsDefault: true
    // });
    // loadedRegions.push({
    //     Region: 'ap-BAD-2',
    //     RegionName: 'pinning-test',
    //     Endpoint: 'pinning-test.badssl.com',
    //     Status: 'OK',
    //     IsDefault: true
    // });

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
    clearUi();
    url = 'https://s3.wasabisys.com/?describeRegions';

    reload_btn.classList.add('hidden');
    error_text.textContent = '';
    loader_spinner.classList.add("spinner-grow")

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

const drawer = document.querySelector('.Drawer');
const btn_us_region_collapse = document.querySelector('#btn_us_region_collapse');
us_region_is_open = false;

function toggleUsRegion() {
    if (us_region_is_open) {
        hide();
    } else {
        show();
    }
}

function show() {
    drawer.classList.remove('hidden');

    /**
    * Force a browser re-paint so the browser will realize the
    * element is no longer `hidden` and allow transitions.
    */
    const reflow = drawer.offsetHeight;

    // Trigger our CSS transition
    drawer.classList.add('is-open');
    us_region_is_open = true;
    btn_us_region_collapse.classList.add('rotate-180')
}

const listener = () => {
    // drawer.setAttribute('hidden', true);
    drawer.classList.add('hidden');
    // drawer.classList.add('is-open');

    drawer.removeEventListener('transitionend', listener);
};

function hide() {
    drawer.addEventListener('transitionend', listener);

    drawer.classList.remove('is-open');

    us_region_is_open = false;
    btn_us_region_collapse.classList.remove('rotate-180')
}