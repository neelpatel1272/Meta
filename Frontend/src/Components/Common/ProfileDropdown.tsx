import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";

const ProfileDropdown = () => {

    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const authUser = sessionStorage.getItem("authUser");
        if (authUser) {
            try {
                const obj = JSON.parse(authUser);

                // Our Laravel backend stores: { status, token, user: { id, name, email, ... } }
                if (obj?.user?.name) {
                    setUserName(obj.user.name);
                    setUserEmail(obj.user.email || "");
                }
                // Fallback for older fake/firebase format
                else if (obj?.data?.first_name) {
                    setUserName(obj.data.first_name);
                    setUserEmail(obj.data.email || "");
                } else if (obj?.email) {
                    setUserName(obj.email);
                }
            } catch (_) {
                // sessionStorage value was malformed — leave defaults
            }
        }
    }, []);

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <img
                            className="rounded-circle header-profile-user"
                            src={avatar1}
                            alt="Header Avatar"
                        />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                                {userName}
                            </span>
                            {userEmail && (
                                <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                                    {userEmail}
                                </span>
                            )}
                        </span>
                    </span>
                </DropdownToggle>

                <DropdownMenu className="dropdown-menu-end mt-1 p-lg-1">
                    <h6 className="dropdown-header">Welcome, {userName}!</h6>

                    <DropdownItem className="p-0 m-1">
                        <Link to="/logout" className="dropdown-item">
                            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle" data-key="t-logout">Logout</span>
                        </Link>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;