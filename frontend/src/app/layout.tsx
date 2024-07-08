import {Metadata} from "next";
import {Manrope} from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Manrope({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Qutty.net",
    description: "New level of a dementia testing. Our online dementia assessment helps you identify potential cognitive issues faster and earlier. Get started with a simple test today.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Script src="https://cdn.amplitude.com/libs/analytics-browser-2.7.4-min.js.gz" strategy="afterInteractive"/>
        <Script src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.4.1-min.js.gz"
                strategy="afterInteractive"/>
        <Script src="https://cdn.amplitude.com/libs/plugin-autocapture-browser-0.9.0-min.js.gz"
                strategy="afterInteractive"/>
        <Script id="amplitude-init" strategy="afterInteractive">
            {`
            (function() {
              const initAmplitude = async () => {
                try {
                  const apiKey = 'a8c1ee5d4c86f5dd5b6827787bd5e250';                  
                  await new Promise(resolve => {
                    const checkAmplitude = () => {
                      if (window.amplitude) {
                        resolve();
                      } else {
                        setTimeout(checkAmplitude, 100);
                      }
                    };
                    checkAmplitude();
                  });

                  window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 })).promise.then(function () {
                    window.amplitude.add(window.amplitudeAutocapturePlugin.plugin());
                    window.amplitude.init(apiKey, null, {
                      apiEndpoint: 'api2.amplitude.com',
                      batchEvents: true,
                      eventUploadPeriodMillis: 10000, // 10 seconds
                      logLevel: 'INFO'
                    });

                    window.amplitude.getInstance().logEvent('PAGE_LOADED');
                  }).catch(function(err) {
                    console.error("Error adding plugins or initializing Amplitude:", err);
                  });
                } catch (error) {
                  console.error("Error initializing Amplitude:", error);
                }
              };

              initAmplitude();
            })();
          `}
        </Script>
        <div className="bg-[hsl(210_100%_97%)]">{children}</div>
        </body>
        </html>
    );
}
