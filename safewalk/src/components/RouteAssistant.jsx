import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

export default function RouteAssistant({
    selectedRoute,
    allRoutes,
    routeAlerts,
    userLocation,
    startLocation,
    endLocation,
}) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("Routes:", JSON.stringify(allRoutes, null, 2));


        if (selectedRoute && messages.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `Hi there! 👋 I'm your SafeWalk assistant. I see you're planning a journey from ${startLocation?.address || 'your starting point'} to ${endLocation?.address || 'your destination'}.

Your selected route is ${selectedRoute.distance} and should take about ${selectedRoute.duration}.

${routeAlerts && routeAlerts.length > 0
                        ? `⚠️ I've noticed there are ${routeAlerts.length} recent 911 calls along or near this route.`
                        : '✅ There are no recent 911 calls along this route.'}

${allRoutes && allRoutes.length > 1
                        ? `I can see ${allRoutes.length} different route options available. Would you like me to compare them and suggest the safest one?`
                        : ''}

How can I help you with your journey today? Feel free to ask me anything about your route, safety concerns, or alternative options!`
            };
            setMessages([welcomeMessage]);
        }
    }, [selectedRoute, routeAlerts, startLocation, endLocation, allRoutes]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            role: 'user',
            content: inputMessage
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Format the selected route with all available data
            const formattedSelectedRoute = {
                distance: selectedRoute.distance,
                duration: selectedRoute.duration,
                summary: selectedRoute.summary,
                warnings: selectedRoute.warnings,
                // Include all available properties from selectedRoute
                ...selectedRoute
            };

            // Format all routes with complete data
            const formattedAllRoutes = allRoutes?.map(route => ({
                distance: route.distance,
                duration: route.duration,
                summary: route.summary,
                warnings: route.warnings,
                // Include all available properties from each route
                ...route
            }));

            // Format route alerts with complete data
            const formattedRouteAlerts = routeAlerts?.map(alert => {
                // Ensure all report data is included
                return {
                    id: alert.id,
                    time: alert.time,
                    rawTime: alert.rawTime,
                    location: alert.location,
                    callType: alert.callType,
                    callTypeOriginal: alert.callTypeOriginal,
                    priority: alert.priority,
                    agency: alert.agency,
                    sensitive: alert.sensitive,
                    latitude: alert.latitude,
                    longitude: alert.longitude,
                    isFuture: alert.isFuture,
                    // Add distance information if available
                    distance: alert.distance || 'within 0.2 mile radius',
                    // Add time period information
                    timeOfDay: getTimeOfDay(alert.rawTime),
                    // Include any additional fields
                    ...alert
                };
            });

            // Format location data with complete information
            const formattedStartLocation = startLocation ? {
                address: startLocation.address,
                lat: startLocation.lat,
                lng: startLocation.lng,
                // Include all available properties
                ...startLocation
            } : null;

            const formattedEndLocation = endLocation ? {
                address: endLocation.address,
                lat: endLocation.lat,
                lng: endLocation.lng,
                // Include all available properties
                ...endLocation
            } : null;

            const formattedUserLocation = userLocation ? {
                lat: userLocation.lat,
                lng: userLocation.lng,
                // Include all available properties
                ...userLocation
            } : null;

            // Log the data being sent to the server
            console.log("Sending route data to AI:", {
                selectedRoute: formattedSelectedRoute,
                allRoutes: formattedAllRoutes,
                routeAlerts: formattedRouteAlerts,
                userLocation: formattedUserLocation,
                startLocation: formattedStartLocation,
                endLocation: formattedEndLocation,
                userQuery: inputMessage
            });

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/route-assistant`, {
                selectedRoute: formattedSelectedRoute,
                allRoutes: formattedAllRoutes,
                routeAlerts: formattedRouteAlerts,
                userLocation: formattedUserLocation,
                startLocation: formattedStartLocation,
                endLocation: formattedEndLocation,
                userQuery: inputMessage
            });

            const assistantMessage = {
                role: 'assistant',
                content: response.data.response
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error while processing your message. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to determine time of day
    const getTimeOfDay = (timestamp) => {
        if (!timestamp) return 'unknown';

        const date = new Date(timestamp);
        const hours = date.getHours();

        if (hours >= 5 && hours < 12) return 'morning';
        if (hours >= 12 && hours < 17) return 'afternoon';
        if (hours >= 17 && hours < 21) return 'evening';
        return 'night';
    };

    return (
        <div className="route-assistant">
            <div className="header">
                <div className="ai-badge">AI</div>
                <h2>Route Assistant</h2>
            </div>
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <p>Select a route to get personalized assistance</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            {message.role === 'user' ? (
                                <p>{message.content}</p>
                            ) : (
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        components={{
                                            code({ inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about your route..."
                    disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </div>
            <style>{`
                .route-assistant {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background-color: #2d2d2d;
                    border-bottom: 1px solid #3d3d3d;
                }

                .ai-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #f0b400;
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 1rem;
                }

                .header h2 {
                    color: #f0b400;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }

                .empty-state {
                    color: #666;
                    text-align: center;
                    padding: 2rem;
                }

                .message {
                    margin-bottom: 1rem;
                    max-width: 80%;
                }

                .message.user {
                    margin-left: auto;
                    background-color: #f0b400;
                    color: #000;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                }

                .message.assistant {
                    margin-right: auto;
                    background-color: #2d2d2d;
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                }

                .input-container {
                    padding: 1rem;
                    border-top: 1px solid #3d3d3d;
                    display: flex;
                    gap: 0.5rem;
                }

                input {
                    flex: 1;
                    background-color: #2d2d2d;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem;
                    resize: none;
                    font-family: inherit;
                }

                input:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px #f0b400;
                }

                button {
                    background-color: #f0b400;
                    color: #000;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                button:disabled {
                    background-color: #4d4d4d;
                    color: #666;
                    cursor: not-allowed;
                }

                .markdown-content {
                    font-size: 14px;
                    line-height: 1.5;
                }

                .markdown-content h1 {
                    font-size: 1.5em;
                    margin-bottom: 0.5em;
                    color: #f0b400;
                }

                .markdown-content h2 {
                    font-size: 1.2em;
                    margin: 1em 0 0.5em;
                    color: #f0b400;
                }

                .markdown-content p {
                    margin: 0.5em 0;
                }

                .markdown-content ul, .markdown-content ol {
                    margin: 0.5em 0;
                    padding-left: 1em;
                }

                .markdown-content li {
                    margin: 0.2em 0;
                }

                .markdown-content code {
                    background: #3d3d3d;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: monospace;
                }

                .markdown-content pre {
                    margin: 1em 0;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .markdown-content blockquote {
                    border-left: 4px solid #f0b400;
                    margin: 1em 0;
                    padding-left: 1em;
                    color: #999;
                }

                .markdown-content a {
                    color: #f0b400;
                    text-decoration: none;
                }

                .markdown-content a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
} 