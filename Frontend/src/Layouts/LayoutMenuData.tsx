import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
    const history = useNavigate();

    const [isDashboard, setIsDashboard] = useState<boolean>(false);
    const [isContacts, setIsContacts] = useState<boolean>(false);
    const [iscurrentState, setIscurrentState] = useState("Dashboard");

    function updateIconSidebar(e: any) {
        if (e && e.target && e.target.getAttribute("sub-items")) {
            const ul: any = document.getElementById("two-column-menu");

            if (!ul) return;

            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            const activeIconItems = [...iconItems];

            activeIconItems.forEach((item: any) => {
                item.classList.remove("active");

                const id = item.getAttribute("sub-items");
                const getID = document.getElementById(id);

                if (getID) {
                    getID.classList.remove("show");
                }
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove("twocolumn-panel");

        if (iscurrentState !== "Dashboard") {
            setIsDashboard(false);
        }

        if (iscurrentState !== "Contacts") {
            setIsContacts(false);
        }
    }, [iscurrentState]);

    const menuItems: any = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "dashboard",
            label: "Dashboards",
            icon: "ri-dashboard-2-line",
            link: "#",
            stateVariables: isDashboard,
            click: function (e: any) {
                e.preventDefault();
                setIsDashboard((prev) => !prev);
                setIscurrentState("Dashboard");
                updateIconSidebar(e);
            },
            subItems: [
                {
                    id: "analytics",
                    label: "Analytics",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "crm",
                    label: "CRM",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "ecommerce",
                    label: "Ecommerce",
                    link: "/dashboard",
                    parentId: "dashboard",
                },
                {
                    id: "crypto",
                    label: "Crypto",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "projects",
                    label: "Projects",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "nft",
                    label: "NFT",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "job",
                    label: "Job",
                    link: "#",
                    parentId: "dashboard",
                },
                {
                    id: "blog",
                    label: "Blog",
                    link: "#",
                    parentId: "dashboard",
                    badgeColor: "success",
                    badgeName: "New",
                },
            ],
        },
        {
            label: "WhatsApp Business API",
            isHeader: true,
        },
        {
            id: "whatsapp-inbox",
            label: "Live Inbox",
            icon: "ri-chat-3-line",
            link: "/inbox",
        },
        {
            id: "whatsapp-setup",
            label: "WhatsApp Setup",
            icon: "ri-whatsapp-line",
            link: "/whatsapp-setup",
        },
        {
            id: "whatsapp-singlesend",
            label: "Single Send",
            icon: "ri-flashlight-line",
            link: "/single-send",
        },
    {
            id: "whatsapp-quickreply",
            label: "Quick Reply",
            icon: "ri-share-forward-line",
            link: "/quick-replies",
        },

        {
            id: "whatsapp-templates",
            label: "Templates",
            icon: "ri-file-text-line",
            link: "/templates",
        },
        {
            id: "whatsapp-contacts",
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
                {
                    id: "whatsapp-contact-list",
                    label: "Contacts",
                    link: "/contacts",
                    parentId: "whatsapp-contacts",
                },
                {
                    id: "whatsapp-contact-groups",
                    label: "Contact Groups",
                    link: "/contact-groups",
                    parentId: "whatsapp-contacts",
                },
                {
                    id: "whatsapp-import-contact",
                    label: "Import Contact",
                    link: "/import-contact",
                    parentId: "whatsapp-contacts",
                },
                {
                    id: "whatsapp-custom-fields",
                    label: "Custom Fields",
                    link: "/custom-fields",
                    parentId: "whatsapp-contacts",
                },
            ],
        },
        {
            id: "whatsapp-campaigns",
            label: "Campaigns",
            icon: "ri-megaphone-line",
            link: "/campaigns",
        },
        // {
        //     id: "whatsapp-labels",
        //     label: "Labels",
        //     icon: "ri-price-tag-3-line",
        //     link: "/labels",
        // },
        // {
        //     id: "whatsapp-link-qr",
        //     label: "Link & QR",
        //     icon: "ri-qr-code-line",
        //     link: "/link-qr",
        // },
        // {
        //     id: "whatsapp-suggested-replies",
        //     label: "Suggested Replies",
        //     icon: "ri-reply-line",
        //     link: "/suggested-replies",
        // },
        // {
        //     id: "whatsapp-autoresponder",
        //     label: "Autoresponder",
        //     icon: "ri-robot-2-line",
        //     link: "/autoresponder",
        // },
        // {
        //     id: "whatsapp-chatbot",
        //     label: "Chatbot",
        //     icon: "ri-chat-smile-2-line",
        //     link: "/chatbot",
        // },
    ];

    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;