import React, { useState, useEffect, useCallback } from 'react';
import './ActivitySelection.css';

// Default maximum time for the timeline
const MAX_TIMELINE = 50;

// Helper function to generate random activities
const generateRandom = (count = 7) => {
  const activities = [];
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  for (let i = 0; i < count; i++) {
    const start = Math.floor(Math.random() * (MAX_TIMELINE - 5));
    const finish = Math.min(MAX_TIMELINE, start + Math.floor(Math.random() * 10) + 2);
    activities.push({
      id: `R${i + 1}`,
      name: names[i % names.length] + (Math.floor(i / names.length) + 1),
      start: start,
      finish: finish,
      status: 'initial', // initial, sorting, checking, selected, rejected
      top: 0, // For layout purposes
    });
  }
  return activities;
};

// The main component
const ActivitySelection = () => {
  const [activities, setActivities] = useState(generateRandom());
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms
  const [timelineScale, setTimelineScale] = useState('dynamic'); // dynamic or fixed
  const [maxTime, setMaxTime] = useState(MAX_TIMELINE);
  const [manualInput, setManualInput] = useState({ name: '', start: '', finish: '' });
  const [currentStep, setCurrentStep] = useState(0);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [message, setMessage] = useState('Add activities or generate random ones, then press Play.');

  // Adjust timeline scale based on activities
  useEffect(() => {
    if (timelineScale === 'dynamic') {
      const max = activities.length > 0
        ? Math.max(...activities.map(a => a.finish), 10) // Minimum scale of 10
        : MAX_TIMELINE;
      setMaxTime(Math.ceil(max / 10) * 10); // Round up to nearest 10
    } else {
      setMaxTime(MAX_TIMELINE);
    }
  }, [activities, timelineScale]);

  // Generate the steps for the algorithm visualization
  const generateSteps = useCallback(() => {
    const steps = [];
    const sorted = [...activities].sort((a, b) => a.finish - b.finish);

    // 1. Sorting Step
    steps.push({
      type: 'message',
      text: 'Sorting activities by finish time...',
    });
    sorted.forEach((_, i) => {
        steps.push({ type: 'sort_visual', sorted: [...sorted].slice(0, i+1) });
    });
     steps.push({
      type: 'message',
      text: 'Sorting complete. Selecting activities...',
    });
    steps.push({ type: 'sort_complete', sorted: [...sorted]});


    // 2. Selection Steps
    let lastFinishTime = 0;
    const selected = [];

    sorted.forEach((activity, index) => {
      // Highlight current activity being checked
      steps.push({ type: 'check', id: activity.id, text: `Checking ${activity.name} (Start: ${activity.start}, Finish: ${activity.finish})` });

      if (activity.start >= lastFinishTime) {
        // Select activity
        selected.push(activity);
        lastFinishTime = activity.finish;
        steps.push({ type: 'select', id: activity.id, selectedIds: [...selected.map(a => a.id)], text: `${activity.name} selected!` });
      } else {
        // Reject activity
        steps.push({ type: 'reject', id: activity.id, text: `${activity.name} conflicts (starts before ${lastFinishTime}). Rejected.` });
      }
    });

    steps.push({ type: 'done', text: `Algorithm finished. ${selected.length} activities selected.` });
    setAlgorithmSteps(steps);
  }, [activities]);

  // Run the animation
  useEffect(() => {
    if (isPlaying && currentStep < algorithmSteps.length) {
      const timer = setTimeout(() => {
        const step = algorithmSteps[currentStep];
        let newActivities = [...activities];
        let newSelected = [...selectedActivities];
        let sortedOrder = isSorted ? [...activities] : [];


        switch (step.type) {
            case 'message':
                setMessage(step.text);
                break;
            case 'sort_visual':
                setMessage('Sorting activities...');
                newActivities = [...activities].sort((a, b) => a.finish - b.finish);
                newActivities.forEach(a => a.status = 'initial'); // Reset status
                step.sorted.forEach((s_act, index) => {
                    const act_index = newActivities.findIndex(a => a.id === s_act.id);
                    if(act_index !== -1) newActivities[act_index].status = 'sorting';
                });
                setActivities(newActivities);
                break;
            case 'sort_complete':
                setMessage('Sorting complete.');
                newActivities = [...step.sorted];
                newActivities.forEach(a => a.status = 'initial');
                setActivities(newActivities);
                setIsSorted(true);
                break;
          case 'check':
            setMessage(step.text);
            newActivities = activities.map(a =>
              a.id === step.id ? { ...a, status: 'checking' } :
              (a.status === 'checking' ? { ...a, status: 'initial' } : a)
            );
            break;
          case 'select':
            setMessage(step.text);
            newActivities = activities.map(a =>
              a.id === step.id ? { ...a, status: 'selected' } : a
            );
            newSelected = activities.filter(a => step.selectedIds.includes(a.id));
            break;
          case 'reject':
            setMessage(step.text);
            newActivities = activities.map(a =>
              a.id === step.id ? { ...a, status: 'rejected' } : a
            );
            break;
          case 'done':
            setMessage(step.text);
            setIsPlaying(false); // Stop when done
            break;
           default:
               break;
        }

        setActivities(newActivities);
        setSelectedActivities(newSelected);
        setCurrentStep(currentStep + 1);

      }, animationSpeed);

      return () => clearTimeout(timer); // Cleanup timer

    } else if (isPlaying && currentStep >= algorithmSteps.length) {
      setIsPlaying(false); // Stop if steps run out
    }
  }, [isPlaying, currentStep, algorithmSteps, animationSpeed, activities, selectedActivities, isSorted]);


  // Handler for Play/Pause button
  const handlePlayPause = () => {
    if (activities.length === 0) {
        setMessage("Please add some activities first!");
        return;
    }
    if (algorithmSteps.length === 0 || !isSorted) {
        generateSteps();
    }
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentStep === 0) {
        setMessage('Starting simulation...');
    }
  };

  // Handler for Reset button
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAlgorithmSteps([]);
    setSelectedActivities([]);
    setIsSorted(false);
    setActivities(prev => prev.map(a => ({ ...a, status: 'initial' })));
    setMessage('Add activities or generate random ones, then press Play.');
  };

  // Handler for generating random activities
  const handleGenerate = () => {
    handleReset(); // Reset first
    setActivities(generateRandom());
    setIsSorted(false);
  };

  // Handler for manual input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setManualInput({ ...manualInput, [name]: value });
  };

  // Handler for adding a manual activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    const { name, start, finish } = manualInput;
    const s = parseInt(start, 10);
    const f = parseInt(finish, 10);

    if (!name || isNaN(s) || isNaN(f)) {
      setMessage("Please enter a valid name, start time, and finish time.");
      return;
    }
    if (s < 0 || f <= s || f > MAX_TIMELINE) {
       setMessage(`Invalid times. Ensure 0 <= Start < Finish <= ${MAX_TIMELINE}.`);
       return;
    }

    const newActivity = {
      id: `M${Date.now()}`,
      name: name,
      start: s,
      finish: f,
      status: 'initial',
      top: 0,
    };
    handleReset();
    setActivities([...activities, newActivity]);
    setManualInput({ name: '', start: '', finish: '' });
     setIsSorted(false);
  };

  // Simple layout algorithm (assign 'top' to prevent overlap)
    const getLayoutActivities = (acts) => {
        const layout = [...acts];
        layout.sort((a, b) => a.start - b.start); // Sort by start time for layout
        const lanes = []; // Keeps track of finish time in each lane

        layout.forEach(activity => {
            let placed = false;
            for (let i = 0; i < lanes.length; i++) {
                if (activity.start >= lanes[i]) {
                    activity.top = i * 40; // Assign lane (height + margin)
                    lanes[i] = activity.finish;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                activity.top = lanes.length * 40;
                lanes.push(activity.finish);
            }
        });
        return layout;
    };

    const laidOutActivities = getLayoutActivities(activities);
    const timelineHeight = Math.max(100, (Math.max(...laidOutActivities.map(a => a.top), 0) + 50));


  return (
    <div className="activity-selection-visualizer">
      {/* Controls Section */}
      <div className="controls-panel">
          <h2>Controls</h2>
          <button onClick={handlePlayPause} disabled={activities.length === 0 || (currentStep >= algorithmSteps.length && currentStep !== 0)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleReset}>Reset</button>
          <button onClick={handleGenerate}>Generate Random</button>
          <div className="control-group">
            <label htmlFor="speed">Speed:</label>
            <input
              type="range"
              id="speed"
              min="100"
              max="2000"
              step="100"
              value={2100 - animationSpeed} // Invert for intuitive slider
              onChange={(e) => setAnimationSpeed(2100 - parseInt(e.target.value))}
            />
          </div>
           <div className="control-group">
              <label>Timeline Scale:</label>
              <button
                  onClick={() => setTimelineScale('dynamic')}
                  className={timelineScale === 'dynamic' ? 'active' : ''}
              >
                  Dynamic
              </button>
              <button
                  onClick={() => setTimelineScale('fixed')}
                  className={timelineScale === 'fixed' ? 'active' : ''}
              >
                  Fixed ({MAX_TIMELINE})
              </button>
          </div>
      </div>

      {/* Manual Input Section */}
      <div className="input-panel">
          <h2>Add Activity</h2>
          <form onSubmit={handleAddActivity}>
              <input
                  type="text"
                  name="name"
                  placeholder="Activity Name (e.g., A1)"
                  value={manualInput.name}
                  onChange={handleInputChange}
                  required
              />
              <input
                  type="number"
                  name="start"
                  placeholder="Start Time"
                  value={manualInput.start}
                  onChange={handleInputChange}
                  required
                  min="0"
              />
              <input
                  type="number"
                  name="finish"
                  placeholder="Finish Time"
                  value={manualInput.finish}
                  onChange={handleInputChange}
                  required
                  min="1"
              />
              <button type="submit">Add</button>
          </form>
      </div>

      {/* Message Bar */}
      <div className="message-bar">
          <p>{message}</p>
      </div>


      {/* Timeline Visualization Section */}
      <div className="timeline-container" style={{height: `${timelineHeight}px`}}>
        <h3>Timeline</h3>
        <div className="timeline-axis">
          {[...Array(maxTime + 1).keys()].map(time => (
             (time % 5 === 0 || time === maxTime) && // Show markers every 5 units
            <div
              key={time}
              className="timeline-marker"
              style={{ left: `${(time / maxTime) * 100}%` }}
            >
              <span>{time}</span>
            </div>
          ))}
        </div>
        <div className="activities-area">
          {laidOutActivities.map((activity) => (
            <div
              key={activity.id}
              className={`activity-bar ${activity.status}`}
              style={{
                left: `${(activity.start / maxTime) * 100}%`,
                width: `${((activity.finish - activity.start) / maxTime) * 100}%`,
                top: `${activity.top}px`,
              }}
              title={`${activity.name}: ${activity.start} - ${activity.finish}`}
            >
              {activity.name} ({activity.start}-{activity.finish})
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="results-panel">
        <h3>Selected Activities ({selectedActivities.length})</h3>
        <ul>
          {selectedActivities.map(activity => (
            <li key={activity.id}>
              {activity.name} (Start: {activity.start}, Finish: {activity.finish})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivitySelection;