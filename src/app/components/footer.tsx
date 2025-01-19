import React from 'react';
import { FaInstagram, FaTiktok, FaPinterest, FaTwitter, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#262D21] text-white py-6">
      <div className="text-center">
        {/* First line: Follow us on */}
        <p className="text-lg font-semibold mb-4">Follow us on:</p>

        {/* Social media icons */}
        <div className="flex justify-center gap-6 mb-4">
          {/* Instagram */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-2xl" />
          </a>

          {/* TikTok */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaTiktok className="text-2xl" />
          </a>

          {/* Pinterest */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaPinterest className="text-2xl" />
          </a>

          {/* X (formerly Twitter) */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-2xl" />
          </a>

          {/* Facebook */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-2xl" />
          </a>

          {/* LinkedIn */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-2xl" />
          </a>

          {/* YouTube */}
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaYoutube className="text-2xl" />
          </a>
        </div>

        {/* Copyright text */}
        <p className="text-sm">&copy; Sprout, Inc. 2025</p>
      </div>
    </footer>
  );
};

export default Footer;
