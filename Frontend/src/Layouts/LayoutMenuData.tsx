import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
    const history = useNavigate();

    const [isWhatsApp, setIsWhatsApp]   = useState<boolean>(false);
    const [isContacts, setIsContacts]   = useState<boolean>(false);
    const [isBilling, setIsBilling]     = useState<boolean>(false);
    const [iscurrentState, setIscurrentState] = useState("Dashboard");

    function updateIconSidebar(e: any) {
        if (e && e.target && e.target.getAttribute("sub-items")) {
            const ul: any = document.getElementById("two-column-menu");
            if (!ul) return;
            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            [...iconItems].forEach((item: any) => {
                item.classList.remove("active");
                const id = item.getAttribute("sub-items");
                const getID = document.getElementById(id);
                if (getID) getID.classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove("twocolumn-panel");
        if (iscurrentState !== "WhatsApp") setIsWhatsApp(false);
        if (iscurrentState !== "Contacts")  setIsContacts(false);
        if (iscurrentState !== "Billing")   setIsBilling(false);
    }, [iscurrentState]);

    const menuItems: any = [
        { label: "Menu", isHeader: true },

        // ── Home ────────────────────────────────────────────────────────────
        {
            id: "dashboard",
            label: "Home",
            icon: "ri-home-2-line",
            link: "/dashboard",
        },

        // ── WhatsApp (expandable) ────────────────────────────────────────
        {
            id: "whatsapp",
            label: "WhatsApp",
            icon: "ri-whatsapp-line",
            link: "#",
            stateVariables: isWhatsApp,
            click: function (e: any) {
                e.preventDefault();
                setIsWhatsApp((prev) => !prev);
                setIscurrentState("WhatsApp");
                updateIconSidebar(e);
            },
            subItems: [
                { id: "whatsapp-setup", label: "Setup", link: "/whatsapp-setup", parentId: "whatsapp" },
                { id: "whatsapp-info",  label: "Info",  link: "/whatsapp-info",  parentId: "whatsapp" },
            ],
        },

        // ── Billing (expandable) ─────────────────────────────────────────
        {
            id: "billing",
            label: "Billing",
            icon: "ri-bank-card-line",
            link: "#",
            stateVariables: isBilling,
            click: function (e: any) {
                e.preventDefault();
                setIsBilling((prev) => !prev);
                setIscurrentState("Billing");
                updateIconSidebar(e);
            },
            subItems: [
                { id: "billing-balance", label: "Balance & Top Up", link: "/billing", parentId: "billing" },
            ],
        },

        // ── Inbox ────────────────────────────────────────────────────────
        {
            id: "inbox",
            label: "Inbox",
            icon: "ri-chat-3-line",
            link: "/inbox",
        },

        // ── History ──────────────────────────────────────────────────────
        {
            id: "history",
            label: "History",
            icon: "ri-history-line",
            link: "/history",
        },

        // ── Single Send ──────────────────────────────────────────────────
        {
            id: "single-send",
            label: "Single Send",
            icon: "ri-flashlight-line",
            link: "/single-send",
        },

        // ── Templates ────────────────────────────────────────────────────
        {
            id: "templates",
            label: "Templates",
            icon: "ri-file-text-line",
            link: "/templates",
        },

        // ── Contacts (expandable) ────────────────────────────────────────
        {
            id: "contacts",
            label: "Contacts",
            icon: "ri-contacts-book-line",
            link: "#",
            stateVariables: isContacts,
            click: function (e: any) {
                e.preventDefault();
                setIsContacts((prev) => !prev);
                setIscurrentState("Contacts");
                updateIconSidebar(e);
            },
            subItems: [
                { id: "contact-list",    label: "Contacts",       link: "/contacts",       parentId: "contacts" },
                { id: "contact-groups",  label: "Contact Groups", link: "/contact-groups", parentId: "contacts" },
                { id: "import-contact",  label: "Import Contact", link: "/import-contact", parentId: "contacts" },
                { id: "custom-fields",   label: "Custom Fields",  link: "/custom-fields",  parentId: "contacts" },
            ],
        },

        // ── Campaigns ────────────────────────────────────────────────────
        {
            id: "campaigns",
            label: "Campaigns",
            icon: "ri-megaphone-line",
            link: "/campaigns",
        },

        // ── Quick Replies ────────────────────────────────────────────────
        {
            id: "quick-replies",
            label: "Suggested Replies",
            icon: "ri-reply-line",
            link: "/quick-replies",
        },
    ];

    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;