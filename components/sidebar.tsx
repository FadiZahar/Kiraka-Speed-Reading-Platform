"use client";

import React, { useState, useEffect } from 'react';
import { useSelectedText } from '@/contexts/SelectedTextContext';
import Image from "next/legacy/image";
import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { RiHome2Line } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import { PiUploadSimpleBold } from "react-icons/pi";
import { MdDone } from "react-icons/md";
import { TbTrash } from "react-icons/tb";


const Sidebar = () => {
  const { selectedTextId, setSelectedTextId } = useSelectedText();
  const [readTexts, setReadTexts] = useState<number[]>([]);
  const [userTexts, setUserTexts] = useState<{id: number, title:string}[]>([]);
  const [activeDelete, setActiveDelete] = useState(null);

  // Array of texts with their IDs
  const texts = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    title: ["Bioluminescence", "Aurora Borealis", "Tungsten", "NASA Mars Rover", "Health & Longevity"][index],
  }));

  const { user } = useUser();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserTexts = async (userId: string | null | undefined) => {
      try {
        const response = await fetch(`/api/texts/user/?user_id=${userId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const user_texts = data.map((text: any) => ({ id: text.text_id, title: `Your text ${text.text_id}` }));
        console.log(user_texts)
        setUserTexts(user_texts); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    }
    if (userId) {
      fetchUserTexts(userId);
    }
  }, [userId]);

  useEffect(() => {
    const fetchReadTexts = async (userId: string | null | undefined) => {
      try {
        const response = await fetch(`/api/practiced_texts/?user_id=${userId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const read_texts = data.read_texts;
        setReadTexts(read_texts); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    };
    if (userId) {
      fetchReadTexts(userId);
    }
  }, [userId]);

  const handleFeedbackClick = () => {
    window.open('https://forms.gle/nijvaqhDHYo3QE2v5', '_blank'); // Opens the link in a new tab
  };

  const handleTextClick = (textId: any) => {
    setSelectedTextId(textId);  // Set the selected text ID
    // window.location.reload();    // Force a full page reload
  };

  const handleDeleteClick = async (textId: any, full_delete: boolean) => {
    try {
      const response = await fetch(`/api/texts/${textId}?user_id=${userId}&full_delete=${full_delete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      else {
      window.location.reload(); 
      }   // Force a full page reload
    } catch (error) {
      console.error("Error deleting text:", error);
    }
  }

    const toggleDeleteDropdown = (e: any, textId: any) => {
    e.stopPropagation();
    setActiveDelete(activeDelete === textId ? null : textId);
  };
  return (
    <div className="sidebar-container flex flex-col h-full bg-gradient-to-l from-black via-black to-black text-white border-t border-r border-black">
      {/* Logo, company name, and horizontal line */}
        <div className="header-container px-4 pt-4">
          <Link href="/">
            <div className="inline-flex items-center justify-center cursor-pointer mr-8">
              <div className="relative w-8 h-8 mr-4 inline-block">
                <Image
                  src="/Kiraka_Logo.png"
                  alt="Kiraka Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <span className="monospace-jetbrains-mono text-2xl font-bold">Kiraka.ai</span>
            </div>
          </Link>
          <hr className="border-t border-gray-700 mt-2 mx-auto" style={{ width: '100%' }} />
          {/* Horizontal line */}
          {/* Link buttons with icons */}
          <div className="flex text-sm flex-col items-start mt-3"> {/* Changed to items-start and added padding left */}
            <Link href="/" passHref>
              <button className="flex items-center mb-2 text-white px-2 py-1 hover:text-cyan-500">
                <RiHome2Line className="mr-2 text-lg" /> Home {/* Icon with margin right */}
              </button>
            </Link>
            <Link href="/instructions" passHref>
              <button className="flex items-center mb-2 text-white px-2 py-1 hover:text-orange-500">
                <HiOutlineDocumentText className="mr-2 text-lg" /> Instructions {/* Icon with margin right */}
              </button>
            </Link>
            <Link href="/analytics" passHref>
              <button className="flex items-center mb-2 text-white px-2 py-1 hover:text-blue-500">
                <TbBrandGoogleAnalytics className="mr-2 text-lg" /> Analytics {/* Icon with margin right */}
              </button>
            </Link>
            <Link href="/upload">
              <button className="flex items-center text-white px-2 py-1 hover:text-purple-500">
                <PiUploadSimpleBold className="mr-2 text-lg" /> Upload your own text
              </button>
            </Link>
          </div>

          {/* Conditional Feedback button with icon */}
          {readTexts.length >= 2 && (
            <div>
              <hr className="border-t border-gray-700 mt-3 mx-auto" style={{ width: '100%' }} />
              <button
                className="flex items-center text-sm text-white px-2 pt-3 hover:text-green-600"
                onClick={handleFeedbackClick}
              >
                <TbSend className="mr-2 text-lg" /> Give Feedback
              </button>
            </div>
          )}
          <hr className="border-t border-gray-700 mt-3 mx-auto" style={{ width: '100%' }} />
        </div>

        {/* Scrollable area for texts */}
        <div className="content-container px-4 flex-grow overflow-auto">
          {/* Kiraka's own texts */}
          <div className="flex text-sm flex-col items-center mt-4"> 
            <div className="title-container-sidebar rounded-xl py-2 text-center mt-2 mb-5">Kiraka&apos;s Texts</div>
            {texts.map((text) => (
              <button
                key={text.id}
                onClick={() => handleTextClick(text.id)}
                className={`flex items-center text-sm w-full max-w-xs px-2 py-sidebar rounded-lg transition sidebar-button-bg
                  ${text.id === selectedTextId ? 'sidebar-button-selected' : ''}`} // Apply active or hover class
              >
                {/* Conditionally render the icon if the text has been read */}
                {readTexts.includes(text.id) && <MdDone className="text-green-600 mr-2" />}
                {text.title}
              </button>
            ))}
          </div>
          {/* User's own texts */}
          <div className="flex text-sm flex-col items-center mt-3">
              <div className="title-container-sidebar rounded-xl py-2 text-center mt-2 mb-5">Your Texts</div>
              {userTexts.map((text) => (
                <div key={text.id} className={`text-button-container w-full max-w-xs ${activeDelete === text.id ? 'active' : ''}`} style={{ position: 'relative' }}>
                    <button
                        onClick={() => handleTextClick(text.id)}
                        className={`flex justify-between items-center text-sm w-full px-2 py-sidebar rounded-lg transition sidebar-button-bg
                          ${text.id === selectedTextId ? 'sidebar-button-selected' : ''}`} // Apply active or hover class
                    >
                        <div className="flex items-center">
                            {readTexts.includes(text.id) && <MdDone className="text-green-600 mr-2" />}
                            {text.title}
                        </div>
                        <TbTrash className="trash-icon opacity-0" style={{ fontSize: '16px' }} onClick={(e) => 
                            toggleDeleteDropdown(e, text.id)
                            // handleDeleteClick(text.id);
                        }/>
                    </button>
                    {activeDelete === text.id && (
                      <div className="trash-dropdown-content text-sm">
                        <ul>
                            <li onClick={(e) => { e.stopPropagation(); handleDeleteClick(text.id, false); }}>Delete but Keep Analytics</li>
                            <li onClick={(e) => { e.stopPropagation(); handleDeleteClick(text.id, true); }}>Deep Delete</li>
                            <li onClick={(e) => { e.stopPropagation(); setActiveDelete(null); }}>Cancel</li>
                        </ul>
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>

      {/* (Fixed Footer) User button fixed at the bottom */}
      <div className="footer-container flex item-center m-2 bg-black py-2 px-2">
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
        <div>
          {user ? (
            <div className=" m-2">
              <div className="text-sm font-medium">{user.fullName}</div>
            </div>
          ) : (
            <div className="text-sm font-medium">Not signed in</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
