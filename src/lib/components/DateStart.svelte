<script>
	export let startDailyDaily;
	export let displayGif;
</script>

<p id="infoTimeDaily">
	<i class="fa-solid fa-calendar-days"></i>
	{`${startDailyDaily.getHours()}`.padStart(2, '0') +
		':' +
		`${startDailyDaily.getMinutes()}`.padStart(2, '0') +
		':' +
		`${startDailyDaily.getSeconds()}`.padStart(2, '0')} -
	{`${startDailyDaily.getDate()}`.padStart(2, '0') +
		'/' +
		`${startDailyDaily.getMonth() + 1}`.padStart(2, '0') +
		'/' +
		startDailyDaily.getFullYear()}
	{displayGif ? '🎉' : ''}
</p>

<style lang="scss">
	#infoTimeDaily {
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 1em;
		font-size: 1.2em;
	}
</style>
