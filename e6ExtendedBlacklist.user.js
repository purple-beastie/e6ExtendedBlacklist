// ==UserScript==
// @name         e6ExtendedBlacklist
// @namespace    prplbst
// @version      0.1.0
// @description  Allows you to have a blacklist longer than 3900 characters
// @author       purple.beastie
// @match        https://e621.net/*
// @match        https://e926.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var settings,
        blacklistSection,
        eBSettings,
        eBLabel,
        eBTextArea,
        eBSaveButton,
        eBCleanButton,
        eBSortButton;

    var saveExtendedBlacklist,
        checkExtendedBlacklist,
        sortExtendedBlacklist;
    var storageBlacklist = localStorage.getItem("extendedBlacklist");


    function setupButton(value) {
        var btn = document.createElement("input");
        btn.type = "button";
        btn.value = value;
        btn.setAttribute("Form", "eb-settings");
        return btn;
    }
    settings = document.querySelector("#user-edit");
    if (settings) {
        eBSettings = document.createElement("form");
        eBLabel = document.createElement("label");
        eBTextArea = document.createElement("textarea");
        eBSaveButton = setupButton("Save Extended Blacklist");
        eBCleanButton = setupButton("Clean");
        eBSortButton = setupButton("Clean and Sort");

        eBSettings.id = "eb-settings";
        eBLabel.setAttribute("for", "eb-blacklist");
        eBLabel.innerText = "Extended Blacklist";
        eBTextArea.id = "eb-blacklist";
        eBTextArea.setAttribute("Form", "eb-settings");
        eBTextArea.innerHTML = storageBlacklist.split("&").join("\n");

        saveExtendedBlacklist = function () {
            localStorage.setItem("extendedBlacklist", eBTextArea.value.split("\n").join("&"));
            notice("Extended Blacklist Saved");
        };
        eBSaveButton.addEventListener("click", saveExtendedBlacklist);
        settings.querySelector('form[action="/user/update"] input[type=submit]').addEventListener("click", saveExtendedBlacklist);

        checkExtendedBlacklist = function() {
            new Ajax.Request("/user/check_blacklist.json",{
                method: "post",
                parameters: {
                    "blacklist": eBTextArea.value,
                    "authenticity_token": document.querySelector("input[name='authenticity_token']").value
                },
                onSuccess: function(resp) {
                    resp = resp.responseJSON;
                    eBTextArea.value = resp.blacklist;
                },
                onFailure: function(resp) {
                    error("Error: " + resp.reason + eBTextArea.value);
                }
            });
        };
        eBCleanButton.addEventListener("click", checkExtendedBlacklist);

        sortExtendedBlacklist = function() {
            var textarea = document.querySelector("#eb-blacklist");
            textarea.value = eBTextArea.value.split("\n").sort().join("\n");
            checkExtendedBlacklist();
        };
        eBSortButton.addEventListener("click", sortExtendedBlacklist);

        settings.insertAdjacentElement("afterbegin", eBSettings);
        blacklistSection = settings.querySelector("#blacklist + .section");
        blacklistSection.appendChild(eBLabel);
        blacklistSection.appendChild(eBTextArea);
        blacklistSection.appendChild(eBCleanButton);
        blacklistSection.appendChild(document.createTextNode (" "));
        blacklistSection.appendChild(eBSortButton);
        blacklistSection.appendChild(document.createTextNode (" "));
        blacklistSection.appendChild(eBSaveButton);
    }

    Cookie.normalGet = Cookie.get;
    Cookie.get = function(name) {
        var getValue = this.normalGet(name);
        if (name === "blacklisted_tags") {
            getValue += "&" + storageBlacklist;
        }
        return getValue;
    };
    var sidebarList = document.querySelector("#blacklisted-list");
    if (sidebarList) {
        while (sidebarList.lastChild) {
            sidebarList.removeChild(sidebarList.lastChild);
        }
    }
    Post.init_blacklisted();
})();
