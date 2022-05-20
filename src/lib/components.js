function getRegionComponent(regionTestResult) {
    return `<div id="region-component-${regionTestResult.Region}" class="p-3 px-6 border border-gray-200  dark:border-gray-500 dark:bg-gray-600 rounded-lg shadow hover:shadow-2xl transition-shadow ease-in-out"> \
                <div \
                class="border-b border-gray-200 py-2 font-bold flex items-center justify-between" \
                > \
                <h3>${regionTestResult.RegionName}</h3> \
                <div id="ping_${regionTestResult.Region}"> \
                    <div class="h-2 w-36 bg-slate-400 rounded animate-pulse"></div> \
                </div> \
                </div> \
                <!--Region code and url --> \
                <div class="my-3"> \
                <!-- <p><span>Region code: </span>ap-northeast-2</p> --> \
                <div class="flex items-center justify-between"> \
                    <span>Endpoint: </span> \
                    <span \
                    class="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300" \
                    >${regionTestResult.Endpoint}</span \
                    > \
                </div> \
                </div> \
                <!--Certificate info--> \
                <div class="grid grid-cols-1 gap-1 mt-1 border-t border-gray-200 dark:border-gray-500 pt-2"> \
                <div class="flex items-center justify-between"> \ 
                    <div class="mr-6">Certificate:</div> \
                    <div id="certValid_${regionTestResult.Region}" class="w-full flex justify-end">\
                        <div class="pulse-loader"></div> \
                    </div>\
                </div> \
                <div class="flex items-center justify-between"> \ 
                    <div class="mr-6">Issuer:</div> \
                    <div id="issuer_${regionTestResult.Region}" class="w-full flex justify-end">\
                        <div class="pulse-loader"></div> \
                    </div>\
                </div> \
                <div class="flex items-center justify-between"> \ 
                    <div class="mr-6">From:</div> \
                    <div id="validFrom_${regionTestResult.Region}" class="w-full flex justify-end">\
                        <div class="pulse-loader"></div> \
                    </div>\
                </div> \
                <div class="flex items-center justify-between"> \ 
                <div class="mr-6">To:</div> \
                <div id="validTo_${regionTestResult.Region}" class="w-full flex justify-end">\
                    <div class="pulse-loader"></div> \
                </div>\
            </div> \
                </div> \
                </div> \
            </div> \ `;
}


function setCertificateValidation(regionName, isValid) {
    let certificateDiv = document.querySelector(`#certValid_${regionName}`);

    if (isValid) {
        certificateDiv.innerHTML = `<span \
        class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded" \
        >Valid</span \
        >`;
    } else {
        certificateDiv.innerHTML = `<span \
        class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded" \
        >InValid</span \
        >`;
    }
}

function setIssuer(regionName, issuer) {
    let issuerDiv = document.querySelector(`#issuer_${regionName}`);
    issuerDiv.innerHTML = `<p>${issuer}</p>`;
}

function setValidFrom(regionName, validFrom) {
    let issuerDiv = document.querySelector(`#validFrom_${regionName}`);
    issuerDiv.innerHTML = `<span \
                    class="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300" \
                    > ${validFrom}\ 
                    </span> \
    `;
}

function setValidTo(regionName, validTo) {
    let issuerDiv = document.querySelector(`#validTo_${regionName}`);
    issuerDiv.innerHTML = `<span \
                    class="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300" \
                    > ${validTo}\ 
                    </span> \
    `;
}

function setAvailablilityBadge(region, isAvailable, ping) {
    let reachability = document.querySelector(`#ping_${region}`);

    if (isAvailable) {
        reachability.innerHTML = `<div class="flex items-center"><img class="w-4 mr-2" src="./assets/images/speedIc.png"/> <span class="text-xs">${ping} (ms)</span>  \
        <span \
        class="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded" \
        >Reachable</span \
      ></div> `;
    } else {
        reachability.innerHTML = '<span \
        class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded" \
        >Unreachable</span \
      > ';
    }
}

function clearUi() {
    us_regions_container.innerHTML = "";
    eu_regions_container.innerHTML = "";
    apac_regions_container.innerHTML = "";
    wasabi_tools_container.innerHTML = "";
    // main_content.classList.add('hidden');
    // loader_content.classList.remove('hidden');
}

function addRegionToCorrespondingUiBlock(region) {
    let targetUiContainer = {};
    if (us_regions_prefix.includes(region.Region.substring(0, 2))) {
        targetUiContainer = us_regions_container;
    } else if (eu_regions_prefix.includes(region.Region.substring(0, 2))) {
        targetUiContainer = eu_regions_container;
    } else if (apac_regions_prefix.includes(region.Region.substring(0, 2))) {
        targetUiContainer = apac_regions_container;
    } else {
        targetUiContainer = wasabi_tools_container;
    }
    targetUiContainer.innerHTML += getRegionComponent(region);

    // container = document.querySelector(`#region-component-${region.Region}`);
    // //console.log(container);
    // container.onclick = () => {
    //     //console.log('Clicked on ' + region.Region + ' component');
    // }
}