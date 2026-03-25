<script>
export default {
    components: {},
};
</script>

<template>
    <div class="background">
        <div class="account-pages my-5 pt-5">
            <BContainer>
                <slot />
            </BContainer>
        </div>
    </div>
</template>

<style>
html,
body,
#app {
    height: 100%;
    margin: 0;
}

.background {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

.background::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 0;

    background-image:
        linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)),
        url("@/assets/images/card_header.jpg");

    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

</style>