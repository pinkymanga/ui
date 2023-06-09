import { Component, OnInit } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { MixpanelService } from '@services/mixpanel/mixpanel.service';

@Component({
	selector: 'app-pages',
	templateUrl: './pages.component.html',
	styleUrls: [ './pages.component.css' ]
})
export class PagesComponent implements OnInit {
	constructor(private idle: Idle, private mixpanelService: MixpanelService) {
		// sets an idle timeout of 1 seconds, for testing purposes.
		idle.setIdle(1);
		// sets a timeout period of 899 seconds. after 10 seconds of inactivity, the user will be considered timed out.
		idle.setTimeout(899);
		// sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
		idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

		idle.onTimeout.subscribe(() => {
			document.location.reload(true);
		});
		this.reset();
	}
	ngOnInit() {
		this.mixpanelService.setSuperProperties();
	}

	reset() {
		this.idle.watch();
	}
}
