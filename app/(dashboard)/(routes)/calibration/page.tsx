"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Type definitions for extended window object and calibration points
interface ExtendedWindow extends Window { webgazer?: any; } // Adjust the type based on the 'webgazer' object
interface CalibrationPoint { x: number; y: number; clicks: number; }
interface CalibrationPoints { [key: string]: CalibrationPoint; }

// Extend the window object to include webgazer
let extendedWindow: ExtendedWindow | undefined;
if (typeof window !== "undefined") {
  extendedWindow = window as ExtendedWindow;
}

export default function WebgazerCalibration() {
  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [calibrationStarted, setCalibrationStarted] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoints>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [allCalibrated, setAllCalibrated] = useState(false);

  const startCalibration = () => {
    setCalibrationStarted(true);
    if (extendedWindow) {
      extendedWindow.webgazer.showPredictionPoints(true); // if bool is true: shows a circle with the current best guess given by the prediction model; if bool is false: turns off the prediction circle
    }
    setShowInstructions(false);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
  };

  useEffect(() => {
    if (webgazerInitialized) {
      initCalibrationPoints();
    }
  }, [webgazerInitialized]);


  // Asynchronous function to initialise the WebGazer library
  const initWebgazer = async () => {
    try {
      // Dynamically imports the WebGazer library
      const webgazerModule = require("webgazer");

      // Checks if the extendedWindow object is available (browser environment)
      if (extendedWindow) {
        // Configures WebGazer with specific settings
        extendedWindow.webgazer = webgazerModule.default
          .setRegression("weightedRidge") // Sets the regression model to "weightedRidge"
          .setTracker("TFFacemesh") // Sets the tracker to "TFFacemesh"
          .applyKalmanFilter(true) // Applies a Kalman filter for smoother predictions
          .showVideo(true) // Shows the video feed from the webcam
          .showPredictionPoints(false) // Initially hides the prediction points
          .addMouseEventListeners() // Adds mouse event listeners for calibration
          .saveDataAcrossSessions(false); // Disables saving data across sessions for privacy

        // Sets up a gaze listener to log data and elapsed time for each prediction
        extendedWindow.webgazer
          .setGazeListener((data: any, elapsedTime: number) => {
            // gaze listener
            console.log(data, elapsedTime);
          })
          .begin(); // Starts the WebGazer eye-tracking
      }
      // Marks WebGazer as initialised
      setWebgazerInitialized(true);
    } catch (err) {
      // Logs any errors that occur during the initialisation
      console.error(err);
    }
  };


  // Function to initialise calibration points on the screen
  const initCalibrationPoints = () => {
    // Sets up initial positions and click counters for each calibration point
    setCalibrationPoints({
      // Each point is positioned relative to the screen's width and height
      // and initialised with 0 clicks
      Pt1: { x: window.innerWidth / 2 - 500, y: window.innerHeight / 2 - 450, clicks: 0 },
      Pt2: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 450, clicks: 0 },
      Pt3: { x: window.innerWidth / 2 + 500, y: window.innerHeight / 2 - 450, clicks: 0 },
      Pt4: { x: window.innerWidth / 2 - 500, y: window.innerHeight / 2, clicks: 0 },
      Pt5: { x: window.innerWidth / 2, y: window.innerHeight / 2, clicks: 0 },
      Pt6: { x: window.innerWidth / 2 + 500, y: window.innerHeight / 2, clicks: 0 }, // Top-center
      Pt7: { x: window.innerWidth / 2 - 500, y: window.innerHeight / 2 + 400, clicks: 0 }, // Right-center
      Pt8: { x: window.innerWidth / 2, y: window.innerHeight / 2 + 400, clicks: 0 }, // Bottom-center
      Pt9: { x: window.innerWidth / 2 + 500, y: window.innerHeight / 2 + 400, clicks: 0 }, // Left-center
    });
  };

  // Handles clicks on calibration points
  const handleCalibrationClick = (pointID: string) => {
    const updatedPoints: CalibrationPoints = { ...calibrationPoints }; // Copies the current state of calibrationPoints to update it
    updatedPoints[pointID].clicks += 1; // Increments the click counter for the clicked calibration point
    setCalibrationPoints(updatedPoints);  // Updates the calibrationPoints state with the new click counts

    if (updatedPoints[pointID].clicks === 5) {  // Checks if the clicked point has reached 5 clicks
      console.log("Calibration point complete");
    }

    // Checks if all calibration points have been clicked 5 times
    const allCalibrated = Object.values(updatedPoints).every(
      (point: CalibrationPoint) => point.clicks >= 5
    );

    // If all points are calibrated, logs the completion and updates state
    if (allCalibrated) {
      console.log("All calibration points complete");
      setAllCalibrated(true); // Marks all points as calibrated
      setCalibrationStarted(false); // Stops the calibration process
      if (extendedWindow) {
        // Shows prediction points, hides the video feed, and removes mouse event listeners
        extendedWindow.webgazer
          .showPredictionPoints(true)
          .showVideo(false)
          .removeMouseEventListeners();
      }

      // Resets the calibration points for potential re-calibration
      initCalibrationPoints();
    }
  };

  // State hook to track if the component has mounted
  const [isMounted, setIsMounted] = useState(false);

  // Effect hook to set isMounted to true after the component has mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Conditional rendering based on the isMounted state
  if (!isMounted) {
    return null;  // Renders nothing if the component hasn't mounted yet
  }

  return (
    <div>
      {/* Initialise WebGazer Button */}
      <button
        onClick={initWebgazer} // Calls the initWebgazer function when clicked
        style={{
          backgroundColor: "#4CAF50", // Green background
          color: "white", // White text
          padding: "10px 20px", // Padding around text
          margin: "10px", // Margin around the button
          border: "none", // No border
          borderRadius: "5px", // Rounded corners
          cursor: "pointer", // Cursor changes to a pointer on hover
          fontSize: "16px", // Font size
          transition: "background-color 0.3s ease", // Smooth transition for background color
        }}
      >
        Initialise WebGazer
      </button>
      {/* Conditionally rendered Start Calibration Button */}
      {webgazerInitialized && (
        <button
          onClick={startCalibration} // Calls the startCalibration function when clicked
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#008CBA", // Blue background
            color: "white", // White text
            padding: "10px 20px", // Padding around text
            border: "none", // No border
            borderRadius: "5px", // Rounded corners
            cursor: "pointer", // Cursor changes to a pointer on hover
            fontSize: "16px", // Font size
            transition: "background-color 0.3s ease", // Smooth transition for background color
          }}
        >
          Start Calibration
        </button>
      )}
      {/* Calibration Points Buttons */}
      {calibrationStarted &&
        Object.entries(calibrationPoints).map(([pointId, point]) => (
          <button
            key={pointId} // React key for list items
            onClick={() => handleCalibrationClick(pointId)} // Calls handleCalibrationClick with pointId
            style={{
              position: "absolute",
              left: `${point.x}px`,
              top: `${point.y}px`,
              backgroundColor: point.clicks >= 5 ? "yellow" : "red", // Color changes based on click count
              // Additional styling as needed
            }}
            disabled={point.clicks >= 5} // Disables button after 5 clicks
          >
            {pointId}
          </button>
        ))}
      {/* Link to Dashboard if All Calibrated */}
      {allCalibrated && (
        <Link href="../dashboard">
          <Button>Go Back</Button>
        </Link>
      )}
      {/* Instructions Overlay */}
      {showInstructions && (
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "black" }}>
            Please follow the on-screen points and click on each one to
            calibrate the eye-tracking system. Ensure you are in a well-lit area
            and maintain a consistent position during calibration.
          </p>
          <button
            onClick={handleGotItClick}
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}